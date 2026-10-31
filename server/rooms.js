import { config } from './config.js';
import { createId, createRoomCode, createToken, normalizeName } from './validate.js';
import { scoreAnswer } from './scoring.js';

const rooms = new Map();
const socketIndex = new Map();

function publicPlayers(room) {
  return [...room.players.values()]
    .map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      correctCount: player.correctCount,
      connected: player.connected,
      isHost: player.id === room.hostId
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

export function publicRoom(room) {
  return {
    code: room.code,
    topic: room.topic,
    difficulty: room.difficulty,
    questionCount: room.questionCount,
    status: room.status,
    hostId: room.hostId,
    source: room.source,
    sourceMessage: room.sourceMessage,
    questionIndex: room.questionIndex,
    totalQuestions: room.questions.length,
    timeLimitMs: room.timeLimitMs,
    questionEndsAt: room.questionEndsAt,
    players: publicPlayers(room)
  };
}

export function getRoom(code) {
  return rooms.get(code) || null;
}

export function getRoomBySocket(socketId) {
  const ref = socketIndex.get(socketId);
  if (!ref) return null;
  const room = rooms.get(ref.code);
  if (!room) return null;
  const player = room.players.get(ref.playerId);
  return player ? { room, player } : null;
}

function uniqueCode() {
  for (let i = 0; i < 40; i += 1) {
    const code = createRoomCode();
    if (!rooms.has(code)) return code;
  }
  throw new Error('Unable to allocate a room code');
}

function bindSocket(socketId, code, playerId) {
  socketIndex.set(socketId, { code, playerId });
}

export function createRoom({ playerName, topic, difficulty, questionCount, socketId }) {
  if (rooms.size >= config.maxRooms) {
    throw new Error('The arena is full. Try again shortly.');
  }

  const name = normalizeName(playerName);
  const code = uniqueCode();
  const playerId = createId();
  const player = {
    id: playerId,
    name,
    socketId,
    reconnectToken: createToken(),
    score: 0,
    correctCount: 0,
    connected: true,
    lastSeen: Date.now()
  };

  const room = {
    code,
    hostId: playerId,
    topic,
    difficulty,
    questionCount,
    status: 'lobby',
    players: new Map([[playerId, player]]),
    questions: [],
    answers: new Map(),
    questionIndex: -1,
    questionStartedAt: 0,
    questionEndsAt: 0,
    timeLimitMs: config.timeLimitMs,
    source: null,
    sourceMessage: '',
    timers: {},
    createdAt: Date.now()
  };

  rooms.set(code, room);
  bindSocket(socketId, code, playerId);
  return { room, player };
}

export function joinRoom({ code, playerName, socketId }) {
  const room = rooms.get(code);
  if (!room) throw new Error('Room not found. Check the code and try again.');
  if (room.status !== 'lobby') throw new Error('This quiz has already started.');
  if (room.players.size >= config.maxPlayers) throw new Error('This room is full (12 players max).');

  const name = normalizeName(playerName);
  const taken = [...room.players.values()].some((player) => player.name.toLowerCase() === name.toLowerCase());
  if (taken) throw new Error('That name is already taken in this room.');

  const playerId = createId();
  const player = {
    id: playerId,
    name,
    socketId,
    reconnectToken: createToken(),
    score: 0,
    correctCount: 0,
    connected: true,
    lastSeen: Date.now()
  };

  room.players.set(playerId, player);
  bindSocket(socketId, code, playerId);
  return { room, player };
}

export function reconnectPlayer({ token, socketId }) {
  for (const room of rooms.values()) {
    for (const player of room.players.values()) {
      if (player.reconnectToken === token) {
        if (Date.now() - player.lastSeen > config.reconnectWindowMs && !player.connected) {
          throw new Error('Reconnect expired. Join a new room.');
        }
        if (player.socketId && player.socketId !== socketId) {
          socketIndex.delete(player.socketId);
        }
        player.socketId = socketId;
        player.connected = true;
        player.lastSeen = Date.now();
        bindSocket(socketId, room.code, player.id);
        return { room, player };
      }
    }
  }
  throw new Error('Reconnect token was not recognized.');
}

export function markDisconnected(socketId) {
  const found = getRoomBySocket(socketId);
  socketIndex.delete(socketId);
  if (!found) return null;
  const { room, player } = found;
  player.connected = false;
  player.lastSeen = Date.now();
  player.socketId = null;

  if (player.id === room.hostId) {
    const nextHost = [...room.players.values()].find((item) => item.connected && item.id !== player.id);
    if (nextHost) room.hostId = nextHost.id;
  }

  return { room, player };
}

export function removeStalePlayers(room) {
  const now = Date.now();
  for (const [id, player] of room.players) {
    if (!player.connected && now - player.lastSeen > config.reconnectWindowMs) {
      room.players.delete(id);
      if (room.hostId === id) {
        const nextHost = [...room.players.values()].find((item) => item.connected);
        room.hostId = nextHost?.id || room.hostId;
      }
    }
  }
}

export function connectedPlayers(room) {
  return [...room.players.values()].filter((player) => player.connected);
}

export function currentQuestion(room) {
  return room.questions[room.questionIndex] || null;
}

export function publicQuestion(room) {
  const question = currentQuestion(room);
  if (!question) return null;
  return {
    index: room.questionIndex,
    total: room.questions.length,
    question: question.question,
    options: question.options,
    endsAt: room.questionEndsAt,
    timeLimitMs: room.timeLimitMs
  };
}

export function beginQuestion(room, index) {
  room.status = 'playing';
  room.questionIndex = index;
  room.questionStartedAt = Date.now();
  room.questionEndsAt = room.questionStartedAt + room.timeLimitMs;
  if (!room.answers.has(index)) room.answers.set(index, new Map());
}

export function submitAnswer(room, player, optionIndex) {
  if (room.status !== 'playing') throw new Error('No question is open for answers.');
  const question = currentQuestion(room);
  if (!question) throw new Error('Question is not available.');
  if (Date.now() > room.questionEndsAt) throw new Error('Time is up for this question.');

  const bucket = room.answers.get(room.questionIndex);
  if (bucket.has(player.id)) throw new Error('You already submitted an answer.');

  const elapsedMs = Date.now() - room.questionStartedAt;
  const correct = optionIndex === question.correctIndex;
  const { points, speedBonus } = scoreAnswer({
    correct,
    elapsedMs,
    timeLimitMs: room.timeLimitMs
  });

  if (correct) {
    player.score += points;
    player.correctCount += 1;
  }

  bucket.set(player.id, {
    optionIndex,
    correct,
    points: correct ? points : 0,
    speedBonus: correct ? speedBonus : 0,
    elapsedMs
  });

  return bucket.get(player.id);
}

export function everyoneAnswered(room) {
  const bucket = room.answers.get(room.questionIndex) || new Map();
  const active = connectedPlayers(room);
  return active.length > 0 && active.every((player) => bucket.has(player.id));
}

export function questionReveal(room, playerId) {
  const question = currentQuestion(room);
  const bucket = room.answers.get(room.questionIndex) || new Map();
  const yours = bucket.get(playerId) || null;

  return {
    index: room.questionIndex,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    yourAnswer: yours,
    answeredCount: bucket.size,
    players: publicPlayers(room)
  };
}

export function leaderboard(room) {
  return publicPlayers(room).map((player, index) => ({
    rank: index + 1,
    ...player
  }));
}

export function finalizeRoom(room) {
  room.status = 'finished';
  const rankings = leaderboard(room);
  room.winner = rankings[0] || null;
  return {
    rankings,
    winner: room.winner,
    topic: room.topic,
    difficulty: room.difficulty,
    source: room.source,
    questions: room.questions.map((question, index) => ({
      index,
      question: question.question,
      options: question.options,
      correctIndex: question.correctIndex,
      explanation: question.explanation
    }))
  };
}

export function deleteRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  for (const timer of Object.values(room.timers)) {
    clearTimeout(timer);
  }
  for (const player of room.players.values()) {
    if (player.socketId) socketIndex.delete(player.socketId);
  }
  rooms.delete(code);
}

export function clearTimer(room, key) {
  if (room.timers[key]) {
    clearTimeout(room.timers[key]);
    delete room.timers[key];
  }
}

export function setRoomTimer(room, key, fn, delay) {
  clearTimer(room, key);
  room.timers[key] = setTimeout(fn, delay);
}

export function roomCount() {
  return rooms.size;
}

export function resetStore() {
  for (const room of rooms.values()) {
    for (const timer of Object.values(room.timers)) clearTimeout(timer);
  }
  rooms.clear();
  socketIndex.clear();
}
