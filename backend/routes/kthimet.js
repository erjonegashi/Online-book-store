'use strict';
const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT kt.*, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri,
             p.data_porosise
      FROM Kthimet kt
      LEFT JOIN Porosite  p ON kt.porosi_id = p.porosi_id
      LEFT JOIN Klientet  k ON p.klient_id  = k.klient_id
      ORDER BY kt.created_at DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Kthimet WHERE kthim_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Kthimi nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { porosi_id, arsyeja, gjendja, shuma } = req.body;
    if (!porosi_id || !arsyeja) return res.status(400).json({ error: 'Porosia dhe arsyeja janë të detyrueshme' });
    const [result] = await db.query(
      'INSERT INTO Kthimet (porosi_id, arsyeja, gjendja, shuma) VALUES (?,?,?,?)',
      [porosi_id, arsyeja, gjendja || 'Pending', shuma || null]
    );
    res.status(201).json({ kthim_id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { porosi_id, arsyeja, gjendja, shuma } = req.body;
    await db.query(
      'UPDATE Kthimet SET porosi_id=?, arsyeja=?, gjendja=?, shuma=? WHERE kthim_id=?',
      [porosi_id, arsyeja, gjendja || 'Pending', shuma || null, req.params.id]
    );
    res.json({ message: 'Kthimi u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Kthimet WHERE kthim_id = ?', [req.params.id]);
    res.json({ message: 'Kthimi u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
