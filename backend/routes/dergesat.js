'use strict';

const router  = require('express').Router();
const Dergesa = require('../models/dergesa.model');

router.get('/', async (_req, res) => {
  try { res.json(await Dergesa.getAll()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const dergesa = await Dergesa.getById(req.params.id);
    if (!dergesa) return res.status(404).json({ error: 'Dërgesa nuk u gjet' });
    res.json(dergesa);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', async (req, res) => {
  if (!req.body.porosi_id)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const dergesa_id = await Dergesa.create(req.body);
    res.status(201).json({ dergesa_id, message: 'Dërgesa u shtua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    await Dergesa.update(req.params.id, req.body);
    res.json({ message: 'Dërgesa u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Dergesa.remove(req.params.id);
    res.json({ message: 'Dërgesa u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
