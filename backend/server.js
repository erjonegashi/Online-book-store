'use strict';

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const cookieParser = require('cookie-parser');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');

const app       = express();
const adminAuth = require('./middleware/adminAuth');

// trust first proxy (nginx/load balancer) so rate limiter sees real client IP
app.set('trust proxy', 1);

app.use(helmet());

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// global fallback limiter — parandalon flood mbi çdo endpoint
app.use(rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             500,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: 'Too many requests. Please slow down.' },
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Public auth routes ────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/admin/auth', require('./routes/admin_auth'));

// ── Public / user-facing routes ───────────────────────────────────────────────
app.use('/api/librat',          require('./routes/librat'));
app.use('/api/autoret',         require('./routes/autoret'));
app.use('/api/kategorite',      require('./routes/kategorite'));
app.use('/api/vleresimet',      require('./routes/vleresimet'));
app.use('/api/lista-deshirave', require('./routes/lista_deshirave'));
app.use('/api/porosite',        require('./routes/porosite'));
app.use('/api/detajet',         require('./routes/detajet'));
app.use('/api/dergesat',        require('./routes/dergesat'));
app.use('/api/pagesat',         require('./routes/pagesat'));
app.use('/api/adresat',         require('./routes/adresat'));
app.use('/api/kuponat',         require('./routes/kuponat'));
app.use('/api/upload',     adminAuth, require('./routes/upload'));
app.use('/api/user/auth',  require('./routes/user_auth'));
app.use('/api/user',       require('./routes/user'));


// ── Admin-protected routes ────────────────────────────────────────────────────
app.use('/api/klientet',    adminAuth, require('./routes/klientet'));
app.use('/api/botuesit',    adminAuth, require('./routes/botuesit'));
app.use('/api/gjuhet',      adminAuth, require('./routes/gjuhet'));
app.use('/api/seria',       adminAuth, require('./routes/seria'));
app.use('/api/promocionet', adminAuth, require('./routes/promocionet'));
app.use('/api/njoftimet',   adminAuth, require('./routes/njoftimet'));
app.use('/api/kthimet',     adminAuth, require('./routes/kthimet'));
app.use('/api/faturat',     adminAuth, require('./routes/faturat'));
app.use('/api/stoku',       adminAuth, require('./routes/stoku'));
app.use('/api/stats',       adminAuth, require('./routes/stats'));

app.get('/', (_req, res) => res.json({ status: 'ok', message: 'BookStore API running' }));

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Database setup ────────────────────────────────────────────────────────────

async function runMigrations() {
  const db     = require('./config/db');
  const bcrypt = require('bcryptjs');
  const { runMigrations: applyMigrations } = require('./database/migrate');

  await applyMigrations(db);

  // Seed default admin account if the table is empty after migrations
  const [[{ cnt }]] = await db.query('SELECT COUNT(*) AS cnt FROM Adminet');
  if (cnt === 0) {
    const seedPw = process.env.ADMIN_SEED_PASSWORD;
    if (!seedPw || seedPw.length < 12) {
      console.error('[DB]     ✗  ADMIN_SEED_PASSWORD nuk është vendosur ose është shumë i shkurtër (min 12 karaktere).');
      console.error('[DB]        Shto ADMIN_SEED_PASSWORD në .env dhe rinis serverin.');
      process.exit(1);
    }
    const hash = await bcrypt.hash(seedPw, 10);
    await db.query(
      `INSERT INTO Adminet (emri, mbiemri, email, fjalekalimi_hash, roli) VALUES (?,?,?,?,?)`,
      ['Admin', 'Bookstore', 'admin@bookstore.com', hash, 'admin']
    );
    console.log('[DB]     ✓  Default admin seeded me fjalëkalimin nga ADMIN_SEED_PASSWORD.');
  }
}

// ── Startup ───────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, async () => {
  const LINE = '─'.repeat(56);
  console.log('\n' + LINE);
  console.log(`  BookStore API   →   http://localhost:${PORT}`);
  console.log(`  Health check    →   http://localhost:${PORT}/api/health`);
  console.log(LINE);

  try {
    await runMigrations();
    console.log('[DB]     ✓  Migrations OK');
  } catch (err) {
    console.error('[DB]     ✗  Migration FAILED:', err.message);
    console.error('[DB]        Check your DB credentials in .env');
  }

  console.log(LINE + '\n');
});

process.on('uncaughtException',  err => console.error('[CRASH] uncaughtException:', err));
process.on('unhandledRejection', err => console.error('[CRASH] unhandledRejection:', err));
