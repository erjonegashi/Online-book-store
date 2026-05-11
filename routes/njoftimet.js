'use strict';
const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
      FROM Njoftimet n
      LEFT JOIN Klientet k ON n.klient_id = k.klient_id
      ORDER BY n.created_at DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/klient/:klient_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Njoftimet WHERE klient_id = ? OR klient_id IS NULL ORDER BY created_at DESC',
      [req.params.klient_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Njoftimet WHERE njoftime_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Njoftimi nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { titulli, mesazhi, lloji, klient_id } = req.body;
    if (!titulli || !mesazhi) return res.status(400).json({ error: 'Titulli dhe mesazhi janë të detyrueshëm' });
    const [result] = await db.query(
      'INSERT INTO Njoftimet (titulli, mesazhi, lloji, klient_id) VALUES (?,?,?,?)',
      [titulli, mesazhi, lloji || 'info', klient_id || null]
    );
    res.status(201).json({ njoftime_id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { titulli, mesazhi, lloji, klient_id, lexuar } = req.body;
    await db.query(
      'UPDATE Njoftimet SET titulli=?, mesazhi=?, lloji=?, klient_id=?, lexuar=? WHERE njoftime_id=?',
      [titulli, mesazhi, lloji || 'info', klient_id || null, lexuar ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Njoftimi u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Njoftimet WHERE njoftime_id = ?', [req.params.id]);
    res.json({ message: 'Njoftimi u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
