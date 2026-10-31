import assert from 'node:assert/strict';
import { io as ioClient } from 'socket.io-client';

process.env.NODE_ENV = 'production';
process.env.PORT = '4005';

const { server } = await import('../server/index.js');
const { resetStore } = await import('../server/rooms.js');

await new Promise((resolve) => server.listen(4005, resolve));
console.log('[TEST] Production Server started on port 4005');

const BASE = 'http://127.0.0.1:4005';

function wait(socket, event, timeout = 35000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for "${event}" on socket ${socket.id || 'unconnected'}`)), timeout);
    socket.once(event, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

function connectClient() {
  const socket = ioClient(BASE, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false
  });
  socket.on('errorMessage', (err) => console.log(`[SOCKET ERR] (${socket.id}):`, err));
  socket.on('generatingQuestions', (e) => console.log('[EVENT] generatingQuestions:', e.message));
  socket.on('generationStatus', (e) => console.log('[EVENT] generationStatus:', e.source, e.message));
  return socket;
}

async function runTwoPlayerMatch() {
  resetStore();
  const player1 = connectClient();
  const player2 = connectClient();

  try {
    console.log('[STEP 1] Connecting two separate browser sessions to the server...');
    await Promise.all([wait(player1, 'serverReady'), wait(player2, 'serverReady')]);
    console.log(' -> Both browser sockets connected successfully.');

    console.log('[STEP 2] Session 1 (Host) creates a room...');
    player1.emit('createRoom', {
      playerName: 'Host_Alice',
      topic: 'Technology',
      difficulty: 'medium',
      questionCount: 5
    });
    const created = await wait(player1, 'roomCreated');
    const roomCode = created.room.code;
    const player1Id = created.playerId;
    const player1Token = created.reconnectToken;
    console.log(` -> Room created with code: ${roomCode}, Host: Host_Alice (ID: ${player1Id})`);
    assert.equal(roomCode.length, 6);
    assert.equal(created.room.players.length, 1);
    assert.ok(player1Token);

    console.log('[STEP 3] Session 2 (Guest) joins room with code...');
    player2.emit('joinRoom', {
      playerName: 'Guest_Bob',
      roomCode: roomCode
    });
    const joined = await wait(player2, 'joinedRoom');
    const player2Id = joined.playerId;
    const player2Token = joined.reconnectToken;
    console.log(` -> Guest_Bob joined room ${roomCode} (ID: ${player2Id})`);
    assert.equal(joined.room.players.length, 2);

    console.log('[STEP 4] Host starts game, generating questions...');
    const hostQuestionP = wait(player1, 'question');
    const guestQuestionP = wait(player2, 'question');
    player1.emit('startGame');

    console.log(' -> Waiting for synchronized question delivery...');
    const [q1, q2] = await Promise.all([hostQuestionP, guestQuestionP]);
    console.log(` -> Question 1 synchronized to both players: "${q1.question}"`);
    assert.equal(q1.question, q2.question);
    assert.deepEqual(q1.options, q2.options);
    assert.equal(q1.options.length, 4);
    assert.equal(q1.correctIndex, undefined, 'SECURITY: correctIndex must NOT be sent before question closes');
    assert.ok(q1.endsAt > Date.now(), 'Countdown timer must be synchronized in the future');

    console.log('[STEP 5] Player 1 submits answer and checks live progress...');
    const progressP = wait(player2, 'answerProgress');
    player1.emit('submitAnswer', { optionIndex: 0 });
    const progress = await progressP;
    console.log(` -> Answer progress event received: ${progress.answeredCount}/${progress.totalPlayers} answered`);
    assert.equal(progress.answeredCount, 1);
    assert.equal(progress.totalPlayers, 2);

    console.log('[STEP 6] Testing duplicate answer rejection on Player 1...');
    const duplicateP = wait(player1, 'errorMessage');
    player1.emit('submitAnswer', { optionIndex: 1 });
    const duplicateErr = await duplicateP;
    console.log(` -> Duplicate answer rejected as expected: "${duplicateErr.message}"`);
    assert.match(duplicateErr.message, /already submitted/i);

    console.log('[STEP 7] Player 2 submits answer, triggering round reveal...');
    const p1ResultP = wait(player1, 'questionResult');
    const p2ResultP = wait(player2, 'questionResult');
    player2.emit('submitAnswer', { optionIndex: 1 });

    const [res1, res2] = await Promise.all([p1ResultP, p2ResultP]);
    console.log(` -> Round complete! Correct option index: ${res1.correctIndex}`);
    console.log(` -> Explanation: "${res1.explanation}"`);
    assert.equal(typeof res1.correctIndex, 'number');
    assert.equal(res1.correctIndex, res2.correctIndex);
    assert.ok(res1.explanation.length > 5);

    console.log('[STEP 8] Validating server-side scores on live leaderboard...');
    const p1Score = res1.players.find((p) => p.name === 'Host_Alice').score;
    const p2Score = res1.players.find((p) => p.name === 'Guest_Bob').score;
    console.log(` -> Scores calculated on server: Host_Alice = ${p1Score} pts, Guest_Bob = ${p2Score} pts`);
    assert.ok(p1Score >= 0 && p2Score >= 0);

    console.log('[STEP 9] Testing disconnection and reconnection with token...');
    player2.close();
    const bobReconnected = connectClient();
    await wait(bobReconnected, 'serverReady');
    bobReconnected.emit('reconnectRoom', { token: player2Token });
    const reconData = await wait(bobReconnected, 'reconnected');
    console.log(` -> Reconnected successfully to room ${reconData.room.code} as player ${reconData.playerId}!`);
    assert.equal(reconData.room.code, roomCode);
    assert.equal(reconData.playerId, player2Id);
    bobReconnected.close();

    console.log('[VERIFICATION COMPLETE] All 2-player multiplayer checks passed with 100% success!');
    process.exit(0);
  } catch (err) {
    console.error('[TEST FAILED]', err);
    process.exit(1);
  } finally {
    player1.close();
    player2.close();
    await new Promise((resolve) => server.close(resolve));
    console.log('[TEST] Server shutdown cleanly.');
  }
}

runTwoPlayerMatch();
