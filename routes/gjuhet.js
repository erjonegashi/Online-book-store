'use strict';
const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Gjuhet ORDER BY emri ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Gjuhet WHERE gjuhe_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Gjuha nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { emri, kodi } = req.body;
    if (!emri) return res.status(400).json({ error: 'Emri i gjuhës është i detyrueshëm' });
    const [result] = await db.query(
      'INSERT INTO Gjuhet (emri, kodi) VALUES (?,?)',
      [emri, kodi || null]
    );
    res.status(201).json({ gjuhe_id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { emri, kodi } = req.body;
    if (!emri) return res.status(400).json({ error: 'Emri i gjuhës është i detyrueshëm' });
    await db.query(
      'UPDATE Gjuhet SET emri=?, kodi=? WHERE gjuhe_id=?',
      [emri, kodi || null, req.params.id]
    );
    res.json({ message: 'Gjuha u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Gjuhet WHERE gjuhe_id = ?', [req.params.id]);
    res.json({ message: 'Gjuha u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
