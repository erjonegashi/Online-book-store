const router = require('express').Router();
const db     = require('../config/db');

const SELECT = `
  SELECT p.*,
    CONCAT(k.emri,' ',k.mbiemri) AS klient_emri,
    k.email AS klient_email
  FROM Porosite p
  LEFT JOIN Klientet k ON p.klient_id = k.klient_id`;

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(SELECT + ' ORDER BY p.porosi_id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows]    = await db.query(SELECT + ' WHERE p.porosi_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Porosia nuk u gjet' });
    const [details] = await db.query(`
      SELECT d.*, l.titulli FROM Detajet_Porosise d
      LEFT JOIN Librat l ON d.liber_id = l.liber_id
      WHERE d.porosi_id = ?`, [req.params.id]);
    res.json({ ...rows[0], detajet: details });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { klient_id, shuma_totale, kostoja_dergeses, statusi, metoda_pageses, adresa_dergeses } = req.body;
    const [result] = await db.query(
      'INSERT INTO Porosite (klient_id,shuma_totale,kostoja_dergeses,statusi,metoda_pageses,adresa_dergeses) VALUES (?,?,?,?,?,?)',
      [klient_id, shuma_totale, kostoja_dergeses||0, statusi||'Pending', metoda_pageses||'Card', adresa_dergeses||null]
    );
    res.status(201).json({ porosi_id: result.insertId, message: 'Porosia u shtua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { klient_id, shuma_totale, kostoja_dergeses, statusi, metoda_pageses, adresa_dergeses } = req.body;
    await db.query(
      'UPDATE Porosite SET klient_id=?,shuma_totale=?,kostoja_dergeses=?,statusi=?,metoda_pageses=?,adresa_dergeses=? WHERE porosi_id=?',
      [klient_id, shuma_totale, kostoja_dergeses||0, statusi, metoda_pageses, adresa_dergeses||null, req.params.id]
    );
    res.json({ message: 'Porosia u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Porosite WHERE porosi_id = ?', [req.params.id]);
    res.json({ message: 'Porosia u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
