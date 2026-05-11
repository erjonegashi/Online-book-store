'use strict';
const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Botuesit ORDER BY botues_id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Botuesit WHERE botues_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Botuesi nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { emri, vendi, website, tel, email } = req.body;
    if (!emri) return res.status(400).json({ error: 'Emri i botuesit është i detyrueshëm' });
    const [result] = await db.query(
      'INSERT INTO Botuesit (emri, vendi, website, tel, email) VALUES (?,?,?,?,?)',
      [emri, vendi || null, website || null, tel || null, email || null]
    );
    res.status(201).json({ botues_id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { emri, vendi, website, tel, email } = req.body;
    if (!emri) return res.status(400).json({ error: 'Emri i botuesit është i detyrueshëm' });
    await db.query(
      'UPDATE Botuesit SET emri=?, vendi=?, website=?, tel=?, email=? WHERE botues_id=?',
      [emri, vendi || null, website || null, tel || null, email || null, req.params.id]
    );
    res.json({ message: 'Botuesi u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Botuesit WHERE botues_id = ?', [req.params.id]);
    res.json({ message: 'Botuesi u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
