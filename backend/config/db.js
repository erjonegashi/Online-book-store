const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'online_book_store',
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
  charset:          'utf8mb4'
});

pool.getConnection((err, conn) => {
  if (err) console.error('DB connection error:', err.message);
  else { console.log('Connected to MySQL database.'); conn.release(); }
});

module.exports = pool.promise();
