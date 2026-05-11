const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT klient_id,emri,mbiemri,email,telefoni,adresa,qyteti,kodi_postar,data_regjistrimit FROM Klientet ORDER BY klient_id DESC'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT klient_id,emri,mbiemri,email,telefoni,adresa,qyteti,kodi_postar,data_regjistrimit FROM Klientet WHERE klient_id=?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Klienti nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/porosite', async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM Porosite WHERE klient_id=? ORDER BY porosi_id DESC',
      [req.params.id]
    );
    const [[stats]] = await db.query(
      'SELECT COUNT(*) as total, COALESCE(SUM(shuma_totale),0) as shpenzuar FROM Porosite WHERE klient_id=?',
      [req.params.id]
    );
    res.json({ orders, total: stats.total, shpenzuar: stats.shpenzuar });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { emri, mbiemri, email, password, telefoni, adresa, qyteti, kodi_postar } = req.body;
    if (!password) return res.status(400).json({ error: 'Fjalëkalimi kërkohet' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO Klientet (emri,mbiemri,email,fjalekalimi_hash,telefoni,adresa,qyteti,kodi_postar) VALUES (?,?,?,?,?,?,?,?)',
      [emri, mbiemri, email, hash, telefoni||null, adresa||null, qyteti||null, kodi_postar||null]
    );
    res.status(201).json({ klient_id: result.insertId, message: 'Klienti u shtua' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email ekziston tashmë' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { emri, mbiemri, email, password, telefoni, adresa, qyteti, kodi_postar } = req.body;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE Klientet SET emri=?,mbiemri=?,email=?,fjalekalimi_hash=?,telefoni=?,adresa=?,qyteti=?,kodi_postar=? WHERE klient_id=?',
        [emri, mbiemri, email, hash, telefoni||null, adresa||null, qyteti||null, kodi_postar||null, req.params.id]
      );
    } else {
      await db.query(
        'UPDATE Klientet SET emri=?,mbiemri=?,email=?,telefoni=?,adresa=?,qyteti=?,kodi_postar=? WHERE klient_id=?',
        [emri, mbiemri, email, telefoni||null, adresa||null, qyteti||null, kodi_postar||null, req.params.id]
      );
    }
    res.json({ message: 'Klienti u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Klientet WHERE klient_id = ?', [req.params.id]);
    res.json({ message: 'Klienti u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
