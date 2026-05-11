'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app       = express();
const adminAuth = require('./middleware/adminAuth');

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Ensure all JSON responses declare UTF-8 so Albanian characters render correctly
app.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
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
app.use('/api/upload',          require('./routes/upload'));
app.use('/api/user',            require('./routes/user'));

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

// ── Database migrations ───────────────────────────────────────────────────────

async function runMigrations() {
  const db     = require('./config/db');
  const bcrypt = require('bcryptjs');

  // Guarantee utf8mb4 for this session before running any DDL
  await db.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'")

  // ── Step 1: Unlock any accounts blocked by old email_verified logic ──────────
  // Force-verify all existing Klientet rows before dropping the column.
  // This ensures users registered under the old system can log in immediately.
  try {
    await db.query('UPDATE Klientet SET email_verified = 1 WHERE email_verified = 0');
    console.log('[DB]     ✓  All student accounts unlocked (email_verified cleared)');
  } catch (_) { /* column already dropped — ignore */ }

  // ── Step 2: Drop email-related columns (no longer needed) ────────────────────
  // Safe on fresh installs — ER_CANT_DROP_FIELD_OR_KEY / ER_NO_SUCH_TABLE ignored.
  const dropKlientet = [
    'ALTER TABLE Klientet DROP COLUMN email_verified',
    'ALTER TABLE Klientet DROP COLUMN verification_token',
    'ALTER TABLE Klientet DROP COLUMN reset_token',
    'ALTER TABLE Klientet DROP COLUMN reset_token_expires',
  ];
  for (const sql of dropKlientet) {
    try { await db.query(sql); }
    catch (e) {
      if (e.code !== 'ER_CANT_DROP_FIELD_OR_KEY' && e.code !== 'ER_NO_SUCH_TABLE') throw e;
    }
  }

  const dropAdminet = [
    'ALTER TABLE Adminet DROP COLUMN reset_token',
    'ALTER TABLE Adminet DROP COLUMN reset_token_expires',
  ];
  for (const sql of dropAdminet) {
    try { await db.query(sql); }
    catch (e) {
      if (e.code !== 'ER_CANT_DROP_FIELD_OR_KEY' && e.code !== 'ER_NO_SUCH_TABLE') throw e;
    }
  }

  // ── Step 2: Create extension tables ──────────────────────────────────────────
  const newTables = [
    `CREATE TABLE IF NOT EXISTS Botuesit (
      botues_id INT AUTO_INCREMENT PRIMARY KEY,
      emri      VARCHAR(255) NOT NULL,
      vendi     VARCHAR(100) DEFAULT NULL,
      website   VARCHAR(255) DEFAULT NULL,
      tel       VARCHAR(20)  DEFAULT NULL,
      email     VARCHAR(255) DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS Gjuhet (
      gjuhe_id INT AUTO_INCREMENT PRIMARY KEY,
      emri     VARCHAR(100) NOT NULL,
      kodi     VARCHAR(10)  DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS Seria (
      seria_id  INT AUTO_INCREMENT PRIMARY KEY,
      emri      VARCHAR(255) NOT NULL,
      pershkrim TEXT         DEFAULT NULL,
      autor_id  INT          DEFAULT NULL,
      FOREIGN KEY (autor_id) REFERENCES Autoret(autori_id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS Promocionet (
      promovim_id        INT AUTO_INCREMENT PRIMARY KEY,
      titulli            VARCHAR(255)   NOT NULL,
      pershkrim          TEXT           DEFAULT NULL,
      perqindja_zbritjes DECIMAL(5,2)   NOT NULL DEFAULT 0,
      kodi               VARCHAR(50)    DEFAULT NULL UNIQUE,
      data_fillimit      DATE           DEFAULT NULL,
      data_mbarimit      DATE           DEFAULT NULL,
      aktive             TINYINT(1)     NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS Njoftimet (
      njoftime_id INT AUTO_INCREMENT PRIMARY KEY,
      titulli     VARCHAR(255) NOT NULL,
      mesazhi     TEXT         NOT NULL,
      lloji       VARCHAR(50)  NOT NULL DEFAULT 'info',
      klient_id   INT          DEFAULT NULL,
      lexuar      TINYINT(1)   NOT NULL DEFAULT 0,
      created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (klient_id) REFERENCES Klientet(klient_id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS Kthimet (
      kthim_id   INT AUTO_INCREMENT PRIMARY KEY,
      porosi_id  INT           DEFAULT NULL,
      arsyeja    TEXT          NOT NULL,
      gjendja    VARCHAR(50)   NOT NULL DEFAULT 'Pending',
      shuma      DECIMAL(10,2) DEFAULT NULL,
      created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (porosi_id) REFERENCES Porosite(porosi_id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS Faturat (
      fatura_id      INT AUTO_INCREMENT PRIMARY KEY,
      porosi_id      INT           DEFAULT NULL,
      numri_fatures  VARCHAR(100)  DEFAULT NULL UNIQUE,
      data           DATE          NOT NULL,
      shuma_total    DECIMAL(10,2) NOT NULL,
      tatimi         DECIMAL(10,2) NOT NULL DEFAULT 0,
      paguar         TINYINT(1)    NOT NULL DEFAULT 0,
      created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (porosi_id) REFERENCES Porosite(porosi_id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS Stoku (
      stok_id          INT AUTO_INCREMENT PRIMARY KEY,
      liber_id         INT          NOT NULL,
      sasia_ndryshimit INT          NOT NULL,
      arsyeja          VARCHAR(255) DEFAULT NULL,
      created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (liber_id) REFERENCES Librat(liber_id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS Adminet (
      admin_id         INT AUTO_INCREMENT PRIMARY KEY,
      emri             VARCHAR(100) NOT NULL,
      mbiemri          VARCHAR(100) NOT NULL,
      email            VARCHAR(255) NOT NULL UNIQUE,
      fjalekalimi_hash VARCHAR(255) NOT NULL,
      roli             VARCHAR(50)  NOT NULL DEFAULT 'admin',
      created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const sql of newTables) {
    try { await db.query(sql); }
    catch (e) { if (e.code !== 'ER_TABLE_EXISTS_ERROR') throw e; }
  }

  // ── Step 2b: Convert all tables to utf8mb4 to fix Albanian character encoding ──
  const allTables = [
    'Klientet','Autoret','Kategorite','Librat','Porosite','Detajet_Porosise',
    'Dergesat','Vleresimet','Lista_Deshirave','Kuponat','Pagesat','Adresat_Dergeses',
    'Botuesit','Gjuhet','Seria','Promocionet','Njoftimet','Kthimet','Faturat','Stoku','Adminet',
  ];
  for (const t of allTables) {
    try { await db.query(`ALTER TABLE ${t} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`); }
    catch (_) { /* table may not exist on first boot — ignore */ }
  }
  console.log('[DB]     ✓  All tables converted to utf8mb4');

  // ── Step 3: Seed default admin if table is empty ──────────────────────────────
  const [[{ cnt }]] = await db.query('SELECT COUNT(*) AS cnt FROM Adminet');
  if (cnt === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await db.query(
      `INSERT INTO Adminet (emri, mbiemri, email, fjalekalimi_hash, roli) VALUES (?,?,?,?,?)`,
      ['Admin', 'Bookstore', 'admin@bookstore.com', hash, 'admin']
    );
    console.log('[DB]     ✓  Default admin seeded  →  admin@bookstore.com / admin123');
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
