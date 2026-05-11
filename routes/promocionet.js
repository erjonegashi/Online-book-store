'use strict';
const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Promocionet ORDER BY promovim_id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Promocionet WHERE promovim_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Promovimi nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { titulli, pershkrim, perqindja_zbritjes, kodi, data_fillimit, data_mbarimit, aktive } = req.body;
    if (!titulli) return res.status(400).json({ error: 'Titulli është i detyrueshëm' });
    if (!perqindja_zbritjes) return res.status(400).json({ error: 'Përqindja e zbritjes është e detyrueshme' });
    const [result] = await db.query(
      `INSERT INTO Promocionet
         (titulli, pershkrim, perqindja_zbritjes, kodi, data_fillimit, data_mbarimit, aktive)
       VALUES (?,?,?,?,?,?,?)`,
      [titulli, pershkrim || null, perqindja_zbritjes, kodi || null,
       data_fillimit || null, data_mbarimit || null, aktive !== undefined ? aktive : 1]
    );
    res.status(201).json({ promovim_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Kodi i promovimit ekziston tashmë' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { titulli, pershkrim, perqindja_zbritjes, kodi, data_fillimit, data_mbarimit, aktive } = req.body;
    if (!titulli) return res.status(400).json({ error: 'Titulli është i detyrueshëm' });
    await db.query(
      `UPDATE Promocionet
          SET titulli=?, pershkrim=?, perqindja_zbritjes=?, kodi=?,
              data_fillimit=?, data_mbarimit=?, aktive=?
        WHERE promovim_id=?`,
      [titulli, pershkrim || null, perqindja_zbritjes, kodi || null,
       data_fillimit || null, data_mbarimit || null, aktive ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Promovimi u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Promocionet WHERE promovim_id = ?', [req.params.id]);
    res.json({ message: 'Promovimi u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
