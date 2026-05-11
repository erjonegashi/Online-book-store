const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, l.titulli, p.data_porosise
      FROM Detajet_Porosise d
      LEFT JOIN Librat   l ON d.liber_id  = l.liber_id
      LEFT JOIN Porosite p ON d.porosi_id = p.porosi_id
      ORDER BY d.detaji_id DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/porosi/:porosi_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT d.*,l.titulli FROM Detajet_Porosise d LEFT JOIN Librat l ON d.liber_id=l.liber_id WHERE d.porosi_id=?',
      [req.params.porosi_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { porosi_id, liber_id, sasia, cmimi_njesi } = req.body;
    const cmimi_total = sasia * cmimi_njesi;
    const [result] = await db.query(
      'INSERT INTO Detajet_Porosise (porosi_id,liber_id,sasia,cmimi_njesi,cmimi_total) VALUES (?,?,?,?,?)',
      [porosi_id, liber_id, sasia, cmimi_njesi, cmimi_total]
    );
    res.status(201).json({ detaji_id: result.insertId, message: 'Detaji u shtua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { porosi_id, liber_id, sasia, cmimi_njesi } = req.body;
    const cmimi_total = sasia * cmimi_njesi;
    await db.query(
      'UPDATE Detajet_Porosise SET porosi_id=?,liber_id=?,sasia=?,cmimi_njesi=?,cmimi_total=? WHERE detaji_id=?',
      [porosi_id, liber_id, sasia, cmimi_njesi, cmimi_total, req.params.id]
    );
    res.json({ message: 'Detaji u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Detajet_Porosise WHERE detaji_id = ?', [req.params.id]);
    res.json({ message: 'Detaji u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
