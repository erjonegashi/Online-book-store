'use strict';

const router = require('express').Router();
const Pagesa = require('../models/pagesa.model');

router.get('/', async (_req, res) => {
  try { res.json(await Pagesa.getAll()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const pagesa = await Pagesa.getById(req.params.id);
    if (!pagesa) return res.status(404).json({ error: 'Pagesa nuk u gjet' });
    res.json(pagesa);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', async (req, res) => {
  const { porosi_id, shuma } = req.body;
  if (!porosi_id || !shuma)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const pagese_id = await Pagesa.create(req.body);
    res.status(201).json({ pagese_id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    await Pagesa.update(req.params.id, req.body);
    res.json({ message: 'Pagesa u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Pagesa.remove(req.params.id);
    res.json({ message: 'Pagesa u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
