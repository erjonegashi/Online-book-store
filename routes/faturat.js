'use strict';
const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
      FROM Faturat f
      LEFT JOIN Porosite  p ON f.porosi_id = p.porosi_id
      LEFT JOIN Klientet  k ON p.klient_id = k.klient_id
      ORDER BY f.fatura_id DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Faturat WHERE fatura_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Fatura nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { porosi_id, numri_fatures, data, shuma_total, tatimi, paguar } = req.body;
    if (!porosi_id || !shuma_total) return res.status(400).json({ error: 'Porosia dhe shuma janë të detyrueshme' });
    const [result] = await db.query(
      `INSERT INTO Faturat (porosi_id, numri_fatures, data, shuma_total, tatimi, paguar)
       VALUES (?,?,?,?,?,?)`,
      [porosi_id, numri_fatures || null, data || new Date().toISOString().slice(0, 10),
       shuma_total, tatimi || 0, paguar ? 1 : 0]
    );
    res.status(201).json({ fatura_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Numri i faturës ekziston tashmë' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { porosi_id, numri_fatures, data, shuma_total, tatimi, paguar } = req.body;
    await db.query(
      `UPDATE Faturat SET porosi_id=?, numri_fatures=?, data=?, shuma_total=?, tatimi=?, paguar=?
       WHERE fatura_id=?`,
      [porosi_id, numri_fatures || null, data, shuma_total, tatimi || 0, paguar ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Fatura u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Faturat WHERE fatura_id = ?', [req.params.id]);
    res.json({ message: 'Fatura u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
