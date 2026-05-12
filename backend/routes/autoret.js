const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Autoret ORDER BY mbiemri, emri');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Autoret WHERE autori_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Autori nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { emri, mbiemri, biografia, shtati, website, email, foto_url } = req.body;
    const [result] = await db.query(
      'INSERT INTO Autoret (emri,mbiemri,biografia,shtati,website,email,foto_url) VALUES (?,?,?,?,?,?,?)',
      [emri, mbiemri, biografia||null, shtati||null, website||null, email||null, foto_url||null]
    );
    res.status(201).json({ autori_id: result.insertId, message: 'Autori u shtua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { emri, mbiemri, biografia, shtati, website, email, foto_url } = req.body;
    await db.query(
      'UPDATE Autoret SET emri=?,mbiemri=?,biografia=?,shtati=?,website=?,email=?,foto_url=? WHERE autori_id=?',
      [emri, mbiemri, biografia||null, shtati||null, website||null, email||null, foto_url||null, req.params.id]
    );
    res.json({ message: 'Autori u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Autoret WHERE autori_id = ?', [req.params.id]);
    res.json({ message: 'Autori u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
