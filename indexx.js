const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) console.log('Gabim:', err);
  else console.log('Connected to MySQL!');
});

app.get('/', (req, res) => {
  res.send('Backend working!');
});

app.get('/books', (req, res) => {
  db.query('SELECT * FROM books', (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});