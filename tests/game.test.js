import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { io as ioClient } from 'socket.io-client';

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = '';
process.env.MONGODB_URI = '';
process.env.PORT = '3457';

const { server } = await import('../server/index.js');
const { resetStore } = await import('../server/rooms.js');

const PORT = 3457;
const BASE = `http://127.0.0.1:${PORT}`;

function wait(socket, event, timeout = 12000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${event}`)), timeout);
    socket.once(event, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

function connectClient() {
  return ioClient(BASE, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false
  });
}

before(async () => {
  await new Promise((resolve) => server.listen(PORT, resolve));
});

after(async () => {
  resetStore();
  await new Promise((resolve) => server.close(resolve));
});

test('health endpoint reports ok', async () => {
  const response = await fetch(`${BASE}/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.service, 'ai-quiz-arena');
});

test('status endpoint reports configuration state', async () => {
  const response = await fetch(`${BASE}/api/status`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(typeof body.geminiConfigured, 'boolean');
  assert.equal(typeof body.mongoConfigured, 'boolean');
  assert.equal(typeof body.mongoConnected, 'boolean');
});

test('history endpoint returns valid structure without MongoDB', async () => {
  const response = await fetch(`${BASE}/api/history`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.enabled, false);
  assert.deepEqual(body.matches, []);
});

test('requires at least 2 players to start a quiz match', async () => {
  resetStore();
  const host = connectClient();
  try {
    await wait(host, 'serverReady');
    host.emit('createRoom', {
      playerName: 'SoloPlayer',
      topic: 'Technology',
      difficulty: 'easy',
      questionCount: 5
    });
    await wait(host, 'roomCreated');
    host.emit('startGame');
    const error = await wait(host, 'errorMessage');
    assert.match(error.message, /at least 2 connected players/i);
  } finally {
    host.close();
  }
});

test('two players can play a synchronized fallback quiz with server-side scoring', async () => {
  resetStore();
  const host = connectClient();
  const guest = connectClient();

  try {
    await Promise.all([wait(host, 'serverReady'), wait(guest, 'serverReady')]);

    host.emit('createRoom', {
      playerName: 'Ava',
      topic: 'Science',
      difficulty: 'easy',
      questionCount: 5
    });
    const created = await wait(host, 'roomCreated');
    assert.equal(created.room.code.length, 6);
    assert.equal(created.room.players.length, 1);

    guest.emit('joinRoom', { playerName: 'Ben', roomCode: created.room.code });
    const joined = await wait(guest, 'joinedRoom');
    assert.equal(joined.room.players.length, 2);

    const hostQuestionP = wait(host, 'question');
    const guestQuestionP = wait(guest, 'question');
    const statusP = wait(host, 'generationStatus', 15000);
    host.emit('startGame');
    const status = await Promise.race([
      statusP,
      wait(host, 'errorMessage', 15000).then((payload) => {
        throw new Error(payload.message);
      })
    ]);
    assert.equal(status.source, 'fallback');
    assert.match(status.message, /built-in|test mode/i);

    const [hostQuestion, guestQuestion] = await Promise.all([
      hostQuestionP,
      guestQuestionP
    ]);
    assert.equal(hostQuestion.question, guestQuestion.question);
    assert.deepEqual(hostQuestion.options, guestQuestion.options);
    assert.equal(hostQuestion.correctIndex, undefined);
    assert.equal(hostQuestion.options.length, 4);

    // Test duplicate answer rejection
    const duplicateP = wait(host, 'errorMessage');
    host.emit('submitAnswer', { optionIndex: 0 });
    host.emit('submitAnswer', { optionIndex: 1 });
    const duplicate = await duplicateP;
    assert.match(duplicate.message, /already submitted/i);

    guest.emit('submitAnswer', { optionIndex: 1 });

    const hostResult = await wait(host, 'questionResult');
    assert.equal(typeof hostResult.correctIndex, 'number');
    assert.ok(hostResult.explanation.length > 7);
    const hostPlayer = hostResult.players.find((player) => player.name === 'Ava');
    const guestPlayer = hostResult.players.find((player) => player.name === 'Ben');
    assert.ok(hostPlayer.score >= 0);
    assert.ok(guestPlayer.score >= 0);
    if (hostResult.yourAnswer?.correct) {
      assert.ok(hostPlayer.score >= 100);
    } else {
      assert.equal(hostPlayer.score, 0);
    }
  } finally {
    host.close();
    guest.close();
  }
});

test('player can reconnect using valid reconnect token in active room', async () => {
  resetStore();
  const host = connectClient();
  const guest = connectClient();
  let reconnectedGuest = null;

  try {
    await Promise.all([wait(host, 'serverReady'), wait(guest, 'serverReady')]);
    host.emit('createRoom', {
      playerName: 'HostPlayer',
      topic: 'History',
      difficulty: 'medium',
      questionCount: 5
    });
    const created = await wait(host, 'roomCreated');

    guest.emit('joinRoom', { playerName: 'GuestPlayer', roomCode: created.room.code });
    const joined = await wait(guest, 'joinedRoom');
    const guestToken = joined.reconnectToken;
    assert.ok(guestToken && guestToken.length > 16);

    // Guest temporarily drops connection
    guest.close();

    // Guest reconnects with their token
    reconnectedGuest = connectClient();
    await wait(reconnectedGuest, 'serverReady');
    reconnectedGuest.emit('reconnectRoom', { token: guestToken });
    const reconnected = await wait(reconnectedGuest, 'reconnected');
    assert.equal(reconnected.room.code, created.room.code);
    assert.equal(reconnected.playerId, joined.playerId);
  } finally {
    host.close();
    guest.close();
    if (reconnectedGuest) reconnectedGuest.close();
  }
});

test('rejects invalid room codes and duplicate names', async () => {
  resetStore();
  const host = connectClient();
  const guest = connectClient();
  try {
    await Promise.all([wait(host, 'serverReady'), wait(guest, 'serverReady')]);
    host.emit('createRoom', {
      playerName: 'Host',
      topic: 'History',
      difficulty: 'medium',
      questionCount: 5
    });
    const created = await wait(host, 'roomCreated');

    guest.emit('joinRoom', { playerName: 'Guest', roomCode: 'ZZZZZZ' });
    const missing = await wait(guest, 'errorMessage');
    assert.match(missing.message, /not found/i);

    guest.emit('joinRoom', { playerName: 'Host', roomCode: created.room.code });
    const duplicate = await wait(guest, 'errorMessage');
    assert.match(duplicate.message, /already taken/i);
  } finally {
    host.close();
    guest.close();
  }
});

test('non-hosts cannot start the match', async () => {
  resetStore();
  const host = connectClient();
  const guest = connectClient();
  try {
    await Promise.all([wait(host, 'serverReady'), wait(guest, 'serverReady')]);
    host.emit('createRoom', {
      playerName: 'Host',
      topic: 'Sports',
      difficulty: 'easy',
      questionCount: 5
    });
    const created = await wait(host, 'roomCreated');
    guest.emit('joinRoom', { playerName: 'Guest', roomCode: created.room.code });
    await wait(guest, 'joinedRoom');
    guest.emit('startGame');
    const denied = await wait(guest, 'errorMessage');
    assert.match(denied.message, /only the host/i);
  } finally {
    host.close();
    guest.close();
  }
});
