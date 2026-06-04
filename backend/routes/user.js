'use strict';

const bcrypt   = require('bcryptjs');
const router   = require('express').Router();
const auth     = require('../middleware/auth');
const Klient   = require('../models/klient.model');
const Njoftimi = require('../models/njoftimi.model');

router.get('/me', auth, async (req, res) => {
  try {
    const klient = await Klient.getById(req.user.id);
    if (!klient) return res.status(404).json({ error: 'User not found' });
    res.json(klient);
  } catch (err) { console.error('[user/me]', err.message); res.status(500).json({ error: 'Internal server error' }); }
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
    console.error('[user/me PUT]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/orders', auth, async (req, res) => {
  try {
    res.json(await Klient.getMyOrders(req.user.id));
  } catch (err) { console.error('[user/orders]', err.message); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/notifications', auth, async (req, res) => {
  try { res.json(await Njoftimi.getByKlient(req.user.id)); }
  catch (err) { console.error('[user/notifications]', err.message); res.status(500).json({ error: 'Internal server error' }); }
});

router.patch('/notifications/:id/read', auth, async (req, res) => {
  try {
    const updated = await Njoftimi.markReadForUser(req.params.id, req.user.id);
    if (!updated) return res.status(404).json({ error: 'Njoftimi nuk u gjet' });
    res.json({ message: 'Njoftimi u shënua si i lexuar' });
  } catch (err) { console.error('[notifications/read]', err.message); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
