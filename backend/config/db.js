const mysql = require('mysql2');
require('dotenv').config();

const rawPool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'online_book_store',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  charset:            'utf8mb4',
});

// Force utf8mb4 on every connection so Albanian characters (ë, ç) survive intact.
rawPool.on('connection', conn => {
  conn.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'", err => {
    if (err) console.error('[DB] SET NAMES failed:', err.message);
  });
});

rawPool.getConnection((err, conn) => {
  if (err) console.error('DB connection error:', err.message);
  else { console.log('Connected to MySQL database.'); conn.release(); }
});

module.exports = rawPool.promise();
