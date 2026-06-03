<<<<<<< HEAD
module.exports = { applyMigrations: async () => {} };
=======
'use strict';

const path  = require('path');
const fs    = require('fs');
const mysql = require('mysql2/promise');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Parse a SQL file that may contain DELIMITER directives (needed for triggers).
 * Returns an array of individual SQL statements to execute one by one.
 */
function parseSql(content) {
  const statements = [];
  let delimiter    = ';';
  let current      = '';

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    // DELIMITER directive — flush current buffer and change delimiter
    if (/^DELIMITER\b/i.test(trimmed)) {
      if (current.trim()) {
        statements.push(current.trim());
        current = '';
      }
      delimiter = trimmed.split(/\s+/)[1] || ';';
      continue;
    }

    current += line + '\n';

    // Flush when the buffer (minus trailing whitespace) ends with the current delimiter
    const buf = current.trimEnd();
    if (buf.endsWith(delimiter)) {
      const stmt = buf.slice(0, buf.length - delimiter.length).trim();
      if (stmt) statements.push(stmt);
      current = '';
    }
  }

  if (current.trim()) statements.push(current.trim());
  return statements.filter(s => s.trim().length > 0);
}

async function runMigrations(db) {
  await db.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");

  // Migration tracking table
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const [applied] = await db.query('SELECT filename FROM schema_migrations ORDER BY filename');
  const appliedSet = new Set(applied.map(r => r.filename));

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`[migrate]   skip  ${file}`);
      continue;
    }

    console.log(`[migrate]   run   ${file} ...`);
    const content    = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const statements = parseSql(content);

    for (const stmt of statements) {
      try {
        await db.query(stmt);
      } catch (err) {
        // Tolerate structural mismatches so migrations are safe on both
        // fresh databases and existing ones with a different history.
        if (
          err.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||  // DROP COLUMN on missing column
          err.code === 'ER_NO_SUCH_TABLE'            ||  // DROP on missing table
          err.code === 'ER_DUP_FIELDNAME'            ||  // ADD COLUMN that already exists
          err.code === 'ER_DUP_KEYNAME'                  // ADD INDEX that already exists
        ) {
          console.log(`[migrate]   warn  ${err.sqlMessage}`);
          continue;
        }
        throw err;
      }
    }

    await db.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
    console.log(`[migrate]   done  ${file}`);
  }

  console.log('[migrate]   All migrations applied');
}

// ── Standalone usage: node backend/database/migrate.js ──────────────────────
if (require.main === module) {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

  (async () => {
    const conn = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'online_book_store',
      charset:  'utf8mb4',
    });
    await conn.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
    try {
      await runMigrations(conn);
    } finally {
      await conn.end();
    }
  })().catch(err => {
    console.error('[migrate]   FAILED:', err.message);
    process.exit(1);
  });
}

module.exports = { runMigrations };
>>>>>>> 1718d9b34ed05f1b70c2bdc726beafeace2fd83f
