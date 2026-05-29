'use strict';

const router = require('express').Router();
const Kthimi = require('../models/kthimi.model');

router.get('/', async (_req, res) => {
  try { res.json(await Kthimi.getAll()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const kthimi = await Kthimi.getById(req.params.id);
    if (!kthimi) return res.status(404).json({ error: 'Kthimi nuk u gjet' });
    res.json(kthimi);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', async (req, res) => {
  const { porosi_id, arsyeja } = req.body;
  if (!porosi_id || !arsyeja)
    return res.status(400).json({ error: 'Porosia dhe arsyeja janë të detyrueshme' });
  try {
    const kthim_id = await Kthimi.create(req.body);
    res.status(201).json({ kthim_id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    await Kthimi.update(req.params.id, req.body);
    res.json({ message: 'Kthimi u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Kthimi.remove(req.params.id);
    res.json({ message: 'Kthimi u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
