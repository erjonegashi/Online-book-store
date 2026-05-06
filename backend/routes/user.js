const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db     = require('../config/db');
const auth   = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT klient_id,emri,mbiemri,email,telefoni,adresa,qyteti,kodi_postar,data_regjistrimit FROM Klientet WHERE klient_id=?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/me', auth, async (req, res) => {
  try {
    const { emri, mbiemri, email, telefoni, adresa, qyteti, kodi_postar, password } = req.body;
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
      const hash = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE Klientet SET emri=?,mbiemri=?,email=?,fjalekalimi_hash=?,telefoni=?,adresa=?,qyteti=?,kodi_postar=? WHERE klient_id=?',
        [emri, mbiemri, email, hash, telefoni || null, adresa || null, qyteti || null, kodi_postar || null, req.user.id]
      );
    } else {
      await db.query(
        'UPDATE Klientet SET emri=?,mbiemri=?,email=?,telefoni=?,adresa=?,qyteti=?,kodi_postar=? WHERE klient_id=?',
        [emri, mbiemri, email, telefoni || null, adresa || null, qyteti || null, kodi_postar || null, req.user.id]
      );
    }
    res.json({ message: 'Profile updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email is already in use' });
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM Porosite WHERE klient_id=? ORDER BY porosi_id DESC',
      [req.user.id]
    );

    const ordersWithItems = await Promise.all(orders.map(async order => {
      const [items] = await db.query(
        `SELECT d.*, l.titulli, l.foto_url, l.liber_id as book_id
         FROM Detajet_Porosise d
         LEFT JOIN Librat l ON d.liber_id = l.liber_id
         WHERE d.porosi_id = ?`,
        [order.porosi_id]
      );
      return { ...order, items };
    }));

    res.json(ordersWithItems);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
