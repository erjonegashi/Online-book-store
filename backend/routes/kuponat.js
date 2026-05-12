const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Kuponat ORDER BY kupon_id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Kuponat WHERE kupon_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Kuponi nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/kodi/:kodi', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Kuponat WHERE kodi=? AND statusi="Active" AND (data_perfundimit IS NULL OR data_perfundimit >= CURDATE())',
      [req.params.kodi]
    );
    if (!rows.length) return res.status(404).json({ error: 'Kuponi jo i vlefshëm' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { kodi, pershkrimi, perqindja_zbritjes, vlera_minimale, data_fillimit, data_perfundimit, statusi } = req.body;
    const [result] = await db.query(
      'INSERT INTO Kuponat (kodi,pershkrimi,perqindja_zbritjes,vlera_minimale,data_fillimit,data_perfundimit,statusi) VALUES (?,?,?,?,?,?,?)',
      [kodi, pershkrimi||null, perqindja_zbritjes, vlera_minimale||0, data_fillimit||null, data_perfundimit||null, statusi||'Active']
    );
    res.status(201).json({ kupon_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Kodi ekziston tashmë' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { kodi, pershkrimi, perqindja_zbritjes, vlera_minimale, data_fillimit, data_perfundimit, statusi } = req.body;
    await db.query(
      'UPDATE Kuponat SET kodi=?,pershkrimi=?,perqindja_zbritjes=?,vlera_minimale=?,data_fillimit=?,data_perfundimit=?,statusi=? WHERE kupon_id=?',
      [kodi, pershkrimi||null, perqindja_zbritjes, vlera_minimale||0, data_fillimit||null, data_perfundimit||null, statusi, req.params.id]
    );
    res.json({ message: 'Kuponi u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Kuponat WHERE kupon_id = ?', [req.params.id]);
    res.json({ message: 'Kuponi u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
