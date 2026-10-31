import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { config } from './config.js';
import { connectDb, getRecentMatches, isDbEnabled } from './db.js';
import { registerSocketHandlers } from './socketHandlers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'ai-quiz-arena',
    time: new Date().toISOString(),
    mongo: isDbEnabled()
  });
});

app.get('/api/status', (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(config.geminiApiKey),
    mongoConfigured: Boolean(config.mongoUri),
    mongoConnected: isDbEnabled()
  });
});

app.get('/api/history', async (_req, res) => {
  try {
    if (!isDbEnabled()) {
      res.json({ enabled: false, matches: [] });
      return;
    }
    const matches = await getRecentMatches(20);
    res.json({ enabled: true, matches });
  } catch (error) {
    res.status(500).json({ enabled: false, matches: [], error: 'Could not load history.' });
  }
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      next();
      return;
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST']
  },
  pingInterval: 20000,
  pingTimeout: 20000
});

registerSocketHandlers(io);

export { app, server, io };

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  connectDb().finally(() => {
    server.listen(config.port, () => {
      console.log(`AI Quiz Arena listening on port ${config.port}`);
      if (!config.geminiApiKey) {
        console.warn('GEMINI_API_KEY is missing. Built-in questions will be used.');
      }
    });
  });
}
