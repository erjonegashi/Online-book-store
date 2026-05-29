'use strict';

const router = require('express').Router();
const Seria  = require('../models/seria.model');

router.get('/', async (_req, res) => {
  try { res.json(await Seria.getAll()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const seria = await Seria.getById(req.params.id);
    if (!seria) return res.status(404).json({ error: 'Seria nuk u gjet' });
    res.json(seria);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', async (req, res) => {
  if (!req.body.emri)
    return res.status(400).json({ error: 'Emri i serisë është i detyrueshëm' });
  try {
    const seria_id = await Seria.create(req.body);
    res.status(201).json({ seria_id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.put('/:id', async (req, res) => {
  if (!req.body.emri)
    return res.status(400).json({ error: 'Emri i serisë është i detyrueshëm' });
  try {
    await Seria.update(req.params.id, req.body);
    res.json({ message: 'Seria u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Seria.remove(req.params.id);
    res.json({ message: 'Seria u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
