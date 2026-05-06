const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ld.*, l.titulli, l.cmimi,
        CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
      FROM Lista_Deshirave ld
      LEFT JOIN Librat    l ON ld.liber_id  = l.liber_id
      LEFT JOIN Klientet  k ON ld.klient_id = k.klient_id
      ORDER BY ld.data_shtimit DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { klient_id, liber_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO Lista_Deshirave (klient_id,liber_id) VALUES (?,?)',
      [klient_id, liber_id]
    );
    res.status(201).json({ deshire_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Tashmë ekziston' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Lista_Deshirave WHERE deshire_id = ?', [req.params.id]);
    res.json({ message: 'U fshi nga lista' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
