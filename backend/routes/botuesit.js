'use strict';

const router  = require('express').Router();
const Botuesi = require('../models/botuesi.model');

router.get('/', async (_req, res) => {
  try { res.json(await Botuesi.getAll()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const botuesi = await Botuesi.getById(req.params.id);
    if (!botuesi) return res.status(404).json({ error: 'Botuesi nuk u gjet' });
    res.json(botuesi);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', async (req, res) => {
  if (!req.body.emri)
    return res.status(400).json({ error: 'Emri i botuesit është i detyrueshëm' });
  try {
    const botues_id = await Botuesi.create(req.body);
    res.status(201).json({ botues_id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.put('/:id', async (req, res) => {
  if (!req.body.emri)
    return res.status(400).json({ error: 'Emri i botuesit është i detyrueshëm' });
  try {
    await Botuesi.update(req.params.id, req.body);
    res.json({ message: 'Botuesi u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Botuesi.remove(req.params.id);
    res.json({ message: 'Botuesi u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
