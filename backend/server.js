const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.get('/', (_req, res) => res.json({ message: 'Bookstore API running' }));

// Auto-migration: add email verification + password reset columns if they don't exist
async function runMigrations() {
  const db = require('./config/db');
  const alterations = [
    'ALTER TABLE Klientet ADD COLUMN email_verified      TINYINT(1)   NOT NULL DEFAULT 0',
    'ALTER TABLE Klientet ADD COLUMN verification_token  VARCHAR(255) DEFAULT NULL',
    'ALTER TABLE Klientet ADD COLUMN reset_token         VARCHAR(255) DEFAULT NULL',
    'ALTER TABLE Klientet ADD COLUMN reset_token_expires DATETIME     DEFAULT NULL',
  ];
  for (const sql of alterations) {
    try { await db.query(sql); }
    catch (e) { /* ER_DUP_FIELDNAME means column already exists — safe to ignore */ }
  }
  // Pre-existing accounts (no verification token) are treated as already verified
  await db.query(
    'UPDATE Klientet SET email_verified = 1 WHERE email_verified = 0 AND verification_token IS NULL'
  );
  console.log('[DB] Migrations applied');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await runMigrations().catch(err => console.error('[DB] Migration error:', err.message));
});
