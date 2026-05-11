const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, p.data_porosise, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
      FROM Dergesat d
      LEFT JOIN Porosite  p ON d.porosi_id = p.porosi_id
      LEFT JOIN Klientet  k ON p.klient_id = k.klient_id
      ORDER BY d.dergesa_id DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Dergesat WHERE dergesa_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Dërgesa nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { porosi_id, kompania_dergeses, numri_gjurmimit, data_dergimit, data_mberritjes, statusi } = req.body;
    const [result] = await db.query(
      'INSERT INTO Dergesat (porosi_id,kompania_dergeses,numri_gjurmimit,data_dergimit,data_mberritjes,statusi) VALUES (?,?,?,?,?,?)',
      [porosi_id, kompania_dergeses||null, numri_gjurmimit||null, data_dergimit||null, data_mberritjes||null, statusi||'Preparing']
    );
    res.status(201).json({ dergesa_id: result.insertId, message: 'Dërgesa u shtua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { porosi_id, kompania_dergeses, numri_gjurmimit, data_dergimit, data_mberritjes, statusi } = req.body;
    await db.query(
      'UPDATE Dergesat SET porosi_id=?,kompania_dergeses=?,numri_gjurmimit=?,data_dergimit=?,data_mberritjes=?,statusi=? WHERE dergesa_id=?',
      [porosi_id, kompania_dergeses||null, numri_gjurmimit||null, data_dergimit||null, data_mberritjes||null, statusi, req.params.id]
    );
    res.json({ message: 'Dërgesa u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Dergesat WHERE dergesa_id = ?', [req.params.id]);
    res.json({ message: 'Dërgesa u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
