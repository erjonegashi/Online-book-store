const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
      FROM Adresat_Dergeses a
      LEFT JOIN Klientet k ON a.klient_id = k.klient_id
      ORDER BY a.adrese_id DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/klient/:klient_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Adresat_Dergeses WHERE klient_id = ? ORDER BY eshte_kryesore DESC',
      [req.params.klient_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { klient_id, emri_pranuesit, adresa, qyteti, kodi_postar, telefoni, eshte_kryesore } = req.body;
    if (eshte_kryesore) {
      await db.query('UPDATE Adresat_Dergeses SET eshte_kryesore=0 WHERE klient_id=?', [klient_id]);
    }
    const [result] = await db.query(
      'INSERT INTO Adresat_Dergeses (klient_id,emri_pranuesit,adresa,qyteti,kodi_postar,telefoni,eshte_kryesore) VALUES (?,?,?,?,?,?,?)',
      [klient_id, emri_pranuesit, adresa, qyteti, kodi_postar||null, telefoni||null, eshte_kryesore?1:0]
    );
    res.status(201).json({ adrese_id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { klient_id, emri_pranuesit, adresa, qyteti, kodi_postar, telefoni, eshte_kryesore } = req.body;
    if (eshte_kryesore) {
      await db.query('UPDATE Adresat_Dergeses SET eshte_kryesore=0 WHERE klient_id=?', [klient_id]);
    }
    await db.query(
      'UPDATE Adresat_Dergeses SET klient_id=?,emri_pranuesit=?,adresa=?,qyteti=?,kodi_postar=?,telefoni=?,eshte_kryesore=? WHERE adrese_id=?',
      [klient_id, emri_pranuesit, adresa, qyteti, kodi_postar||null, telefoni||null, eshte_kryesore?1:0, req.params.id]
    );
    res.json({ message: 'Adresa u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Adresat_Dergeses WHERE adrese_id = ?', [req.params.id]);
    res.json({ message: 'Adresa u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
