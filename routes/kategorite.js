const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT k.*, p.emri AS prind_emri
      FROM Kategorite k
      LEFT JOIN Kategorite p ON k.kategoria_prind_id = p.kategori_id
      ORDER BY k.emri
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Kategorite WHERE kategori_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Kategoria nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { emri, pershkrimi, kategoria_prind_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO Kategorite (emri,pershkrimi,kategoria_prind_id) VALUES (?,?,?)',
      [emri, pershkrimi||null, kategoria_prind_id||null]
    );
    res.status(201).json({ kategori_id: result.insertId, message: 'Kategoria u shtua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { emri, pershkrimi, kategoria_prind_id } = req.body;
    await db.query(
      'UPDATE Kategorite SET emri=?,pershkrimi=?,kategoria_prind_id=? WHERE kategori_id=?',
      [emri, pershkrimi||null, kategoria_prind_id||null, req.params.id]
    );
    res.json({ message: 'Kategoria u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Kategorite WHERE kategori_id = ?', [req.params.id]);
    res.json({ message: 'Kategoria u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
