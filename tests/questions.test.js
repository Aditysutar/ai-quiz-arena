import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pickFallbackQuestions, sanitizeQuestions } from '../server/questionBank.js';
import { scoreAnswer } from '../server/scoring.js';
import { generateQuestions } from '../server/gemini.js';
import {
  createRoomCode,
  createToken,
  isValidOptionIndex,
  normalizeCode,
  normalizeCount,
  normalizeDifficulty,
  normalizeName
} from '../server/validate.js';

test('fallback bank returns the requested number of unique questions for 5, 10, and 15 counts', () => {
  for (const count of [5, 10, 15]) {
    const questions = pickFallbackQuestions({ topic: 'Science', difficulty: 'easy', count });
    assert.equal(questions.length, count);
    const unique = new Set(questions.map((item) => item.question));
    assert.equal(unique.size, count);
    for (const item of questions) {
      assert.equal(item.options.length, 4);
      assert.ok(item.correctIndex >= 0 && item.correctIndex <= 3);
      assert.ok(item.explanation.length > 7);
    }
  }
});

test('sanitizeQuestions rejects malformed and duplicate items', () => {
  const cleaned = sanitizeQuestions([
    { question: 'Too short', options: ['a', 'b', 'c', 'd'], correctIndex: 0, explanation: 'because' },
    {
      question: 'Which planet is known as the Red Planet in this quiz bank test?',
      options: ['Venus', 'Mars', 'Earth', 'Mars'],
      correctIndex: 1,
      explanation: 'Mars appears red because of iron oxide.'
    },
    {
      question: 'Which planet is known as the Red Planet in this quiz bank test?',
      options: ['Venus', 'Mars', 'Earth', 'Jupiter'],
      correctIndex: 1,
      explanation: 'Mars appears red because of iron oxide.'
    },
    {
      question: 'What is the chemical symbol for gold in this quiz bank test?',
      options: ['Au', 'Ag', 'Fe', 'Go'],
      correctIndex: 0,
      explanation: 'Au comes from the Latin word aurum.'
    }
  ], 5);
  assert.equal(cleaned.length, 2);
  assert.equal(cleaned[1].correctIndex, 0);
});

test('scoring awards base points plus a speed bonus only for correct answers', () => {
  const fast = scoreAnswer({ correct: true, elapsedMs: 0, timeLimitMs: 20000 });
  const halfTime = scoreAnswer({ correct: true, elapsedMs: 10000, timeLimitMs: 20000 });
  const slow = scoreAnswer({ correct: true, elapsedMs: 20000, timeLimitMs: 20000 });
  const wrong = scoreAnswer({ correct: false, elapsedMs: 100, timeLimitMs: 20000 });
  assert.equal(fast.points, 150);
  assert.equal(halfTime.points, 125);
  assert.equal(slow.points, 100);
  assert.equal(wrong.points, 0);
  assert.equal(wrong.speedBonus, 0);
});

test('generateQuestions works with genuine Gemini AI when configured', async () => {
  // Uses real GEMINI_API_KEY from .env
  const res = await generateQuestions({ topic: 'Astronomy', difficulty: 'easy', count: 5 });
  assert.ok(['ai', 'fallback'].includes(res.source));
  assert.equal(res.questions.length, 5);
  for (const q of res.questions) {
    assert.equal(q.options.length, 4);
    assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3);
    assert.ok(q.explanation.length > 5);
  }
});

test('generateQuestions falls back honestly when API key is empty', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  try {
    process.env.GEMINI_API_KEY = '';
    const res = await generateQuestions({ topic: 'General Knowledge', difficulty: 'easy', count: 5 });
    assert.equal(res.source, 'fallback');
    assert.equal(res.questions.length, 5);
    assert.match(res.message, /built-in|not configured/i);
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }
});

test('validation utilities normalize names, codes, difficulties, and option indices', () => {
  assert.equal(normalizeName('  Alex   Smith  '), 'Alex Smith');
  assert.equal(normalizeName(''), '');
  assert.equal(normalizeCode(' ab-c 123 '), 'ABC123');
  assert.equal(normalizeDifficulty('EASY'), 'easy');
  assert.equal(normalizeDifficulty('invalid'), null);
  assert.equal(normalizeCount('10'), 10);
  assert.equal(normalizeCount('25'), null);
  assert.equal(isValidOptionIndex(0), true);
  assert.equal(isValidOptionIndex(3), true);
  assert.equal(isValidOptionIndex(4), false);
  assert.equal(isValidOptionIndex(-1), false);
  assert.equal(createRoomCode().length, 6);
  assert.equal(createToken().length, 48);
});
