import { config } from './config.js';
import { generateQuestions } from './gemini.js';
import { saveMatchResult } from './db.js';
import { allowRequest } from './rateLimit.js';
import {
  beginQuestion,
  clearTimer,
  connectedPlayers,
  createRoom,
  currentQuestion,
  deleteRoom,
  everyoneAnswered,
  finalizeRoom,
  getRoom,
  getRoomBySocket,
  leaderboard,
  markDisconnected,
  publicQuestion,
  publicRoom,
  questionReveal,
  reconnectPlayer,
  removeStalePlayers,
  setRoomTimer,
  submitAnswer,
  joinRoom as enterRoom
} from './rooms.js';
import {
  isValidOptionIndex,
  normalizeCode,
  normalizeCount,
  normalizeDifficulty,
  normalizeName,
  normalizeTopic
} from './validate.js';

function emitError(socket, message) {
  socket.emit('errorMessage', { message });
}

function roomChannel(code) {
  return `room:${code}`;
}

function broadcastRoom(io, room) {
  io.to(roomChannel(room.code)).emit('roomUpdated', publicRoom(room));
  io.to(roomChannel(room.code)).emit('leaderboard', { players: leaderboard(room) });
}

function answerProgress(io, room) {
  const bucket = room.answers.get(room.questionIndex) || new Map();
  io.to(roomChannel(room.code)).emit('answerProgress', {
    answeredCount: bucket.size,
    totalPlayers: connectedPlayers(room).length
  });
}

async function revealAndContinue(io, room) {
  if (room.status !== 'playing') return;
  room.status = 'revealing';
  clearTimer(room, 'question');

  const question = currentQuestion(room);
  if (!question) return;

  for (const player of room.players.values()) {
    if (!player.socketId) continue;
    io.to(player.socketId).emit('questionResult', questionReveal(room, player.id));
  }
  io.to(roomChannel(room.code)).emit('leaderboard', { players: leaderboard(room) });

  const nextIndex = room.questionIndex + 1;
  setRoomTimer(room, 'next', async () => {
    if (nextIndex >= room.questions.length) {
      const results = finalizeRoom(room);
      io.to(roomChannel(room.code)).emit('gameOver', results);
      await saveMatchResult({
        roomCode: room.code,
        topic: room.topic,
        difficulty: room.difficulty,
        questionCount: room.questionCount,
        source: room.source,
        players: results.rankings.map((player) => ({
          name: player.name,
          score: player.score,
          correctCount: player.correctCount
        })),
        winner: results.winner ? { name: results.winner.name, score: results.winner.score } : null,
        createdAt: new Date(room.createdAt),
        finishedAt: new Date()
      });
      setRoomTimer(room, 'cleanup', () => deleteRoom(room.code), 10 * 60 * 1000);
      return;
    }
    startQuestion(io, room, nextIndex);
  }, config.nextDelayMs);
}

function startQuestion(io, room, index) {
  beginQuestion(room, index);
  io.to(roomChannel(room.code)).emit('question', publicQuestion(room));
  answerProgress(io, room);
  const wait = Math.max(0, room.questionEndsAt - Date.now());
  setRoomTimer(room, 'question', () => {
    revealAndContinue(io, room);
  }, wait);
}

export function registerSocketHandlers(io) {
  io.use((socket, next) => {
    const ip = socket.handshake.address || 'unknown';
    if (!allowRequest(`conn:${ip}`, { limit: 60, windowMs: 60_000 })) {
      next(new Error('Connection rate limit exceeded. Please wait a moment.'));
      return;
    }
    next();
  });

  io.on('connection', (socket) => {
    socket.emit('serverReady', { ok: true, version: '1.0.0' });

    socket.on('createRoom', (payload = {}) => {
      try {
        const ip = socket.handshake.address || 'unknown';
        if (!allowRequest(`create:${ip}`, { limit: 12, windowMs: 10 * 60_000 })) {
          throw new Error('Too many rooms created recently. Please wait a moment.');
        }
        const playerName = normalizeName(payload.playerName);
        const topic = normalizeTopic(payload.topic);
        const difficulty = normalizeDifficulty(payload.difficulty);
        const questionCount = normalizeCount(payload.questionCount);
        if (!playerName) throw new Error('Please enter your player name.');
        if (!topic) throw new Error('Please select or enter a quiz topic.');
        if (!difficulty) throw new Error('Please choose a valid difficulty level.');
        if (!questionCount) throw new Error('Please choose 5, 10, or 15 questions.');

        const existing = getRoomBySocket(socket.id);
        if (existing) {
          throw new Error('You are already connected to a room.');
        }

        const { room, player } = createRoom({
          playerName,
          topic,
          difficulty,
          questionCount,
          socketId: socket.id
        });
        socket.join(roomChannel(room.code));
        socket.emit('roomCreated', {
          playerId: player.id,
          reconnectToken: player.reconnectToken,
          room: publicRoom(room)
        });
        broadcastRoom(io, room);
      } catch (error) {
        emitError(socket, error.message);
      }
    });

    socket.on('joinRoom', (payload = {}) => {
      try {
        const ip = socket.handshake.address || 'unknown';
        if (!allowRequest(`join:${ip}`, { limit: 30, windowMs: 10 * 60_000 })) {
          throw new Error('Too many join attempts. Please wait a moment.');
        }
        const playerName = normalizeName(payload.playerName);
        const code = normalizeCode(payload.roomCode);
        if (!playerName) throw new Error('Please enter your player name.');
        if (code.length !== 6) throw new Error('Please enter a valid 6-character room code.');
        if (getRoomBySocket(socket.id)) throw new Error('You are already connected to a room.');

        const { room, player } = enterRoom({ code, playerName, socketId: socket.id });
        socket.join(roomChannel(room.code));
        socket.emit('joinedRoom', {
          playerId: player.id,
          reconnectToken: player.reconnectToken,
          room: publicRoom(room)
        });
        broadcastRoom(io, room);
      } catch (error) {
        emitError(socket, error.message);
      }
    });

    socket.on('reconnectRoom', (payload = {}) => {
      try {
        const token = String(payload.token || '').trim();
        if (!token || token.length < 16) throw new Error('Missing or invalid reconnect token.');
        const { room, player } = reconnectPlayer({ token, socketId: socket.id });
        socket.join(roomChannel(room.code));
        socket.emit('reconnected', {
          playerId: player.id,
          reconnectToken: player.reconnectToken,
          room: publicRoom(room),
          question: room.status === 'playing' ? publicQuestion(room) : null
        });
        broadcastRoom(io, room);
      } catch (error) {
        emitError(socket, error.message);
      }
    });

    socket.on('startGame', () => {
      const found = getRoomBySocket(socket.id);
      if (!found) {
        emitError(socket, 'Join a room first.');
        return;
      }
      const { room, player } = found;
      if (player.id !== room.hostId) {
        emitError(socket, 'Only the host can start the quiz match.');
        return;
      }
      if (room.status !== 'lobby') {
        emitError(socket, 'The quiz has already started.');
        return;
      }
      removeStalePlayers(room);
      if (connectedPlayers(room).length < config.minPlayers) {
        emitError(socket, `At least ${config.minPlayers} connected players are required to start.`);
        return;
      }

      room.status = 'generating';
      io.to(roomChannel(room.code)).emit('generatingQuestions', {
        message: 'Generating quiz questions with Google Gemini...'
      });
      broadcastRoom(io, room);

      generateQuestions({
        topic: room.topic,
        difficulty: room.difficulty,
        count: room.questionCount
      })
        .then((result) => {
          const live = getRoom(room.code);
          if (!live || live.status !== 'generating') return;
          live.questions = result.questions;
          live.source = result.source;
          live.sourceMessage = result.message;
          io.to(roomChannel(live.code)).emit('generationStatus', {
            source: result.source,
            message: result.message
          });
          startQuestion(io, live, 0);
        })
        .catch((error) => {
          emitError(socket, `Question generation failed: ${error.message || 'Unknown error'}`);
          room.status = 'lobby';
          broadcastRoom(io, room);
        });
    });

    socket.on('submitAnswer', (payload = {}) => {
      try {
        const found = getRoomBySocket(socket.id);
        if (!found) throw new Error('Join a room first.');
        const optionIndex = Number.parseInt(payload.optionIndex, 10);
        if (!isValidOptionIndex(optionIndex)) throw new Error('Please select one of the four options.');

        // Server calculates and stores score internally
        submitAnswer(found.room, found.player, optionIndex);

        // Security: NEVER leak whether the answer was correct before the question closes!
        socket.emit('answerAccepted', { accepted: true, optionIndex });
        answerProgress(io, found.room);

        if (everyoneAnswered(found.room)) {
          revealAndContinue(io, found.room);
        }
      } catch (error) {
        emitError(socket, error.message);
      }
    });

    socket.on('leaveRoom', () => {
      const found = markDisconnected(socket.id);
      if (!found) return;
      socket.leave(roomChannel(found.room.code));
      if (connectedPlayers(found.room).length === 0 && ['lobby', 'finished'].includes(found.room.status)) {
        deleteRoom(found.room.code);
        return;
      }
      if (found.room.status === 'playing' && everyoneAnswered(found.room)) {
        revealAndContinue(io, found.room);
      }
      broadcastRoom(io, found.room);
    });

    socket.on('disconnect', () => {
      const found = markDisconnected(socket.id);
      if (!found) return;
      if (connectedPlayers(found.room).length === 0) {
        if (['lobby', 'finished'].includes(found.room.status)) {
          deleteRoom(found.room.code);
          return;
        }
        // For in-progress games with zero connected players, schedule cleanup after reconnect window
        setRoomTimer(found.room, 'abandonedCleanup', () => {
          if (connectedPlayers(found.room).length === 0) {
            deleteRoom(found.room.code);
          }
        }, config.reconnectWindowMs);
      }
      if (found.room.status === 'playing' && everyoneAnswered(found.room)) {
        revealAndContinue(io, found.room);
      }
      broadcastRoom(io, found.room);
    });
  });
}
