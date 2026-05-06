'use strict';

// Load .env FIRST — before any other require that reads process.env
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check (use this to verify the backend is alive) ────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/librat',          require('./routes/librat'));
app.use('/api/autoret',         require('./routes/autoret'));
app.use('/api/kategorite',      require('./routes/kategorite'));
app.use('/api/klientet',        require('./routes/klientet'));
app.use('/api/porosite',        require('./routes/porosite'));
app.use('/api/detajet',         require('./routes/detajet'));
app.use('/api/dergesat',        require('./routes/dergesat'));
app.use('/api/vleresimet',      require('./routes/vleresimet'));
app.use('/api/lista-deshirave', require('./routes/lista_deshirave'));
app.use('/api/kuponat',         require('./routes/kuponat'));
app.use('/api/pagesat',         require('./routes/pagesat'));
app.use('/api/adresat',         require('./routes/adresat'));
app.use('/api/upload',          require('./routes/upload'));
app.use('/api/stats',           require('./routes/stats'));
app.use('/api/user',            require('./routes/user'));

app.get('/', (_req, res) => res.json({ status: 'ok', message: 'BookStore API running' }));

// Generic 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Database migration ────────────────────────────────────────────────────────

async function runMigrations() {
  const db = require('./config/db');

  // Add columns one-by-one; ignore ER_DUP_FIELDNAME if already present
  const alterations = [
    'ALTER TABLE Klientet ADD COLUMN email_verified      TINYINT(1)   NOT NULL DEFAULT 0',
    'ALTER TABLE Klientet ADD COLUMN verification_token  VARCHAR(255) DEFAULT NULL',
    'ALTER TABLE Klientet ADD COLUMN reset_token         VARCHAR(255) DEFAULT NULL',
    'ALTER TABLE Klientet ADD COLUMN reset_token_expires DATETIME     DEFAULT NULL',
  ];

  for (const sql of alterations) {
    try {
      await db.query(sql);
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;  // re-throw unexpected errors
    }
  }

  // Accounts that existed before verification was introduced → mark as verified
  await db.query(
    `UPDATE Klientet
        SET email_verified = 1
      WHERE email_verified = 0
        AND verification_token IS NULL`
  );
}

// ── Startup ───────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, async () => {
  const LINE = '─'.repeat(56);
  console.log('\n' + LINE);
  console.log(`  BookStore API   →   http://localhost:${PORT}`);
  console.log(`  Health check    →   http://localhost:${PORT}/api/health`);
  console.log(LINE);

  // 1. DB migration
  try {
    await runMigrations();
    console.log('[DB]     ✓  Migrations OK');
  } catch (err) {
    console.error('[DB]     ✗  Migration FAILED:', err.message);
    console.error('[DB]        Check your DB credentials in .env');
  }

  // 2. SMTP check
  const { verifySmtp } = require('./utils/mailer');
  await verifySmtp();

  console.log(LINE + '\n');
});

// ── Prevent silent crashes ────────────────────────────────────────────────────
process.on('uncaughtException',  err => console.error('[CRASH] uncaughtException:', err));
process.on('unhandledRejection', err => console.error('[CRASH] unhandledRejection:', err));
