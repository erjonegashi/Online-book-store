'use strict';

const router     = require('express').Router();
const Vleresimi  = require('../models/vleresimi.model');
const auth       = require('../middleware/auth');
const adminAuth  = require('../middleware/adminAuth');

router.get('/', async (req, res) => {
  try { res.json(await Vleresimi.getAll(req.query.liber_id)); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', auth, async (req, res) => {
  const { liber_id, klient_id, nota } = req.body;
  if (!liber_id || !klient_id || !nota)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const vleresim_id = await Vleresimi.create(req.body);
    res.status(201).json({ vleresim_id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    await Vleresimi.update(req.params.id, req.body);
    res.json({ message: 'Vlerësimi u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Vleresimi.remove(req.params.id);
    res.json({ message: 'Vlerësimi u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
