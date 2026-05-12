const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT pg.*, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
      FROM Pagesat pg
      LEFT JOIN Porosite  p ON pg.porosi_id = p.porosi_id
      LEFT JOIN Klientet  k ON p.klient_id  = k.klient_id
      ORDER BY pg.pagese_id DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Pagesat WHERE pagese_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Pagesa nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { porosi_id, shuma, metoda, statusi, referenca_transaksionit } = req.body;
    const [result] = await db.query(
      'INSERT INTO Pagesat (porosi_id,shuma,metoda,statusi,referenca_transaksionit) VALUES (?,?,?,?,?)',
      [porosi_id, shuma, metoda||'Card', statusi||'Pending', referenca_transaksionit||null]
    );
    res.status(201).json({ pagese_id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { porosi_id, shuma, metoda, statusi, referenca_transaksionit } = req.body;
    await db.query(
      'UPDATE Pagesat SET porosi_id=?,shuma=?,metoda=?,statusi=?,referenca_transaksionit=? WHERE pagese_id=?',
      [porosi_id, shuma, metoda, statusi, referenca_transaksionit||null, req.params.id]
    );
    res.json({ message: 'Pagesa u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Pagesat WHERE pagese_id = ?', [req.params.id]);
    res.json({ message: 'Pagesa u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
