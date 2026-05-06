const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, l.titulli, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
      FROM Vleresimet v
      LEFT JOIN Librat    l ON v.liber_id  = l.liber_id
      LEFT JOIN Klientet  k ON v.klient_id = k.klient_id
      ORDER BY v.data DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { liber_id, klient_id, nota, komenti, statusi } = req.body;
    const [result] = await db.query(
      'INSERT INTO Vleresimet (liber_id,klient_id,nota,komenti,statusi) VALUES (?,?,?,?,?)',
      [liber_id, klient_id, nota, komenti||null, statusi||'Pending']
    );
    res.status(201).json({ vleresim_id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { liber_id, klient_id, nota, komenti, statusi } = req.body;
    await db.query(
      'UPDATE Vleresimet SET liber_id=?,klient_id=?,nota=?,komenti=?,statusi=? WHERE vleresim_id=?',
      [liber_id, klient_id, nota, komenti||null, statusi, req.params.id]
    );
    res.json({ message: 'Vlerësimi u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Vleresimet WHERE vleresim_id = ?', [req.params.id]);
    res.json({ message: 'Vlerësimi u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
