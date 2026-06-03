'use strict';

const router    = require('express').Router();
const Porosi    = require('../models/porosi.model');
const auth      = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.get('/', adminAuth, async (_req, res) => {
  try { res.json(await Porosi.getAll()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/:id', adminAuth, async (req, res) => {
  try {
    const porosi = await Porosi.getById(req.params.id);
    if (!porosi) return res.status(404).json({ error: 'Porosia nuk u gjet' });
    res.json(porosi);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', auth, async (req, res) => {
  const { shuma_totale } = req.body;
  if (!shuma_totale)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const porosi_id = await Porosi.create({ ...req.body, klient_id: req.user.id });
    res.status(201).json({ porosi_id, message: 'Porosia u shtua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    await Porosi.update(req.params.id, req.body);
    res.json({ message: 'Porosia u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Porosi.remove(req.params.id);
    res.json({ message: 'Porosia u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
