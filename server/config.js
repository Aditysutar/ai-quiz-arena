import dotenv from 'dotenv';

dotenv.config();

function parsePort(value) {
  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port > 0 ? port : 3000;
}

function sanitizeModel(value) {
  const model = String(value || '').trim();
  if (/^gemini[-a-z0-9.]+$/i.test(model)) return model;
  return 'gemini-3.5-flash-lite';
}

export const config = {
  port: parsePort(process.env.PORT),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: String(process.env.GEMINI_API_KEY || '').trim(),
  geminiModel: sanitizeModel(process.env.GEMINI_MODEL),
  mongoUri: String(process.env.MONGODB_URI || '').trim(),
  mongoDb: String(process.env.MONGODB_DB || 'ai_quiz_arena').trim() || 'ai_quiz_arena',
  timeLimitMs: 20000,
  minPlayers: 2,
  maxPlayers: 12,
  maxRooms: 400,
  questionCounts: [5, 10, 15],
  difficulties: ['easy', 'medium', 'hard', 'mixed'],
  reconnectWindowMs: 90_000,
  generationTimeoutMs: 28_000,
  nextDelayMs: process.env.NODE_ENV === 'test' ? 80 : 4500
};

export const FALLBACK_MODELS = [
  config.geminiModel,
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest'
].filter((model, index, list) => list.indexOf(model) === index);
