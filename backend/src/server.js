'use strict';

require('express-async-errors');
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression = require('compression');
const rateLimit  = require('express-rate-limit');
const http       = require('http');
const { WebSocketServer } = require('ws');

const { connectDB, sequelize } = require('./database/db');
// Import models so Sequelize registers associations before sync
require('./models/index');

const authRoutes    = require('./routes/auth');
const compileRoutes = require('./routes/compile');
const aiRoutes      = require('./routes/ai');
const dsaRoutes     = require('./routes/dsa');
const adminRoutes   = require('./routes/admin');

const app    = express();
const server = http.createServer(app);

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max:      parseInt(process.env.RATE_LIMIT_MAX || '100'),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Too many requests — please wait a moment' },
});

const compileLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: 'Too many compilation requests — slow down!' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many AI requests — take a breath and try again' },
});

app.use('/api/', globalLimiter);
app.use('/api/compile', compileLimiter);
app.use('/api/ai',      aiLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/compile', compileRoutes);
app.use('/api/ai',      aiRoutes);
app.use('/api/dsa',     dsaRoutes);
app.use('/api/admin',   adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success:   true,
    service:   'SYLESS Backend',
    version:   '1.0.0',
    database:  'MySQL (Sequelize)',
    ai:        'Groq (Llama 3) + Gemini fallback',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
  });
});

// ─── WebSocket (Live Collaboration) ──────────────────────────────────────────
const wss   = new WebSocketServer({ server, path: '/ws' });
const rooms = new Map();

wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.replace('/ws?', ''));
  const roomId = params.get('room') || 'default';
  const userId = params.get('userId') || 'anonymous';

  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId).add(ws);

  ws.send(JSON.stringify({ type: 'connected', message: 'Connected to SYLESS collaboration server' }));

  ws.on('message', (data) => {
    try {
      const msg  = JSON.parse(data.toString());
      const room = rooms.get(roomId);
      if (room) {
        room.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify({ ...msg, from: userId }));
          }
        });
      }
    } catch (_) {}
  });

  ws.on('close', () => {
    const room = rooms.get(roomId);
    if (room) {
      room.delete(ws);
      if (room.size === 0) rooms.delete(roomId);
    }
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[SYLESS Error]', err.message);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ success: false, error: err.errors[0].message });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(409).json({ success: false, error: `${field} already exists` });
  }
  if (err.name === 'SequelizeDatabaseError') {
    console.error('[DB Error]', err.original?.code, err.message);
    return res.status(500).json({ success: false, error: 'Database error — check your MySQL connection' });
  }
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    return res.status(503).json({ success: false, error: 'Cannot connect to database' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: `${req.method} ${req.url} not found` });
});

// ─── Startup ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();

    // Auto-sync tables (alter:true = safe update, won't drop data)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced');

    server.listen(PORT, () => {
      console.log(`\n🚀 SYLESS Backend running → http://localhost:${PORT}`);
      console.log(`🌐 Frontend allowed from  → ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`🔗 WebSocket ready        → ws://localhost:${PORT}/ws`);
      console.log(`🤖 AI Provider            → Groq (Llama 3) + Gemini fallback`);
      console.log(`🗄️  Database               → MySQL (${process.env.DB_HOST}/${process.env.DB_NAME})\n`);
    });
  } catch (err) {
    console.error('\n❌ Failed to start:', err.message);
    if (err.name?.includes('Sequelize')) {
      console.error('   → Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env');
    }
    process.exit(1);
  }
}

start();

module.exports = app;
