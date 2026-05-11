'use strict';
const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, CONCAT(a.emri,' ',a.mbiemri) AS autor_emri
      FROM Seria s
      LEFT JOIN Autoret a ON s.autor_id = a.autor_id
      ORDER BY s.seria_id DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Seria WHERE seria_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Seria nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { emri, pershkrim, autor_id } = req.body;
    if (!emri) return res.status(400).json({ error: 'Emri i serisë është i detyrueshëm' });
    const [result] = await db.query(
      'INSERT INTO Seria (emri, pershkrim, autor_id) VALUES (?,?,?)',
      [emri, pershkrim || null, autor_id || null]
    );
    res.status(201).json({ seria_id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { emri, pershkrim, autor_id } = req.body;
    if (!emri) return res.status(400).json({ error: 'Emri i serisë është i detyrueshëm' });
    await db.query(
      'UPDATE Seria SET emri=?, pershkrim=?, autor_id=? WHERE seria_id=?',
      [emri, pershkrim || null, autor_id || null, req.params.id]
    );
    res.json({ message: 'Seria u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Seria WHERE seria_id = ?', [req.params.id]);
    res.json({ message: 'Seria u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
