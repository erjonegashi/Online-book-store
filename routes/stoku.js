'use strict';
const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, l.titulli
      FROM Stoku s
      LEFT JOIN Librat l ON s.liber_id = l.liber_id
      ORDER BY s.stok_id DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/liber/:liber_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Stoku WHERE liber_id = ? ORDER BY created_at DESC',
      [req.params.liber_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Stoku WHERE stok_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Lëvizja e stokut nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { liber_id, sasia_ndryshimit, arsyeja } = req.body;
    if (!liber_id || sasia_ndryshimit === undefined) {
      return res.status(400).json({ error: 'Libri dhe sasia janë të detyrueshme' });
    }
    const [result] = await db.query(
      'INSERT INTO Stoku (liber_id, sasia_ndryshimit, arsyeja) VALUES (?,?,?)',
      [liber_id, sasia_ndryshimit, arsyeja || null]
    );
    // Update the stock quantity on Librat
    await db.query(
      'UPDATE Librat SET sasia_stok = sasia_stok + ? WHERE liber_id = ?',
      [sasia_ndryshimit, liber_id]
    );
    res.status(201).json({ stok_id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { liber_id, sasia_ndryshimit, arsyeja } = req.body;
    await db.query(
      'UPDATE Stoku SET liber_id=?, sasia_ndryshimit=?, arsyeja=? WHERE stok_id=?',
      [liber_id, sasia_ndryshimit, arsyeja || null, req.params.id]
    );
    res.json({ message: 'Lëvizja e stokut u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Stoku WHERE stok_id = ?', [req.params.id]);
    res.json({ message: 'Lëvizja e stokut u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
