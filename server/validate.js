import { config } from './config.js';

export function normalizeName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ').slice(0, 24);
}

export function normalizeTopic(topic) {
  return String(topic || '').trim().slice(0, 60);
}

export function normalizeCode(code) {
  return String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export function normalizeDifficulty(value) {
  const difficulty = String(value || '').trim().toLowerCase();
  return config.difficulties.includes(difficulty) ? difficulty : null;
}

export function normalizeCount(value) {
  const count = Number.parseInt(value, 10);
  return config.questionCounts.includes(count) ? count : null;
}

export function isValidOptionIndex(value) {
  return Number.isInteger(value) && value >= 0 && value <= 3;
}

export function createRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createId() {
  return crypto.randomUUID();
}
