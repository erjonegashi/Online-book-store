'use strict';

const bcrypt   = require('bcryptjs');
const router   = require('express').Router();
const auth     = require('../middleware/auth');
const Klient   = require('../models/klient.model');
const Detaji   = require('../models/detaji.model');
const Njoftimi = require('../models/njoftimi.model');

router.get('/me', auth, async (req, res) => {
  try {
    const klient = await Klient.getById(req.user.id);
    if (!klient) return res.status(404).json({ error: 'User not found' });
    res.json(klient);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/me', auth, async (req, res) => {
  const { password, currentPassword } = req.body;

  if (password && password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    if (password) {
      const row = await Klient.getHashById(req.user.id);
      if (!row) return res.status(404).json({ error: 'User not found' });
      const match = await bcrypt.compare(currentPassword || '', row.fjalekalimi_hash);
      if (!match) return res.status(401).json({ error: 'Current password is incorrect' });
      const hash = await bcrypt.hash(password, 10);
      await Klient.updateProfileWithHash(req.user.id, hash, req.body);
    } else {
      await Klient.updateProfile(req.user.id, req.body);
    }
    res.json({ message: 'Profile updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email is already in use' });
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Klient.getMyOrders(req.user.id);
    const ordersWithItems = await Promise.all(orders.map(async order => {
      const items = await Detaji.getByPorosiWithDetails(order.porosi_id);
      return { ...order, items };
    }));
    res.json(ordersWithItems);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/notifications', auth, async (req, res) => {
  try { res.json(await Njoftimi.getByKlient(req.user.id)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/notifications/:id/read', auth, async (req, res) => {
  try {
    await Njoftimi.markRead(req.params.id);
    res.json({ message: 'Njoftimi u shënua si i lexuar' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
