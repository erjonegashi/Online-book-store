'use strict';

const router = require('express').Router();
const Libri  = require('../models/libri.model');

router.get('/', async (req, res) => {
  try {
    const librat = await Libri.getAll(req.query.search);
    res.json(librat);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const libri = await Libri.getById(req.params.id);
    if (!libri) return res.status(404).json({ error: 'Libri nuk u gjet' });
    res.json(libri);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', async (req, res) => {
  const { titulli, cmimi } = req.body;
  if (!titulli || !cmimi)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const liber_id = await Libri.create(req.body);
    res.status(201).json({ liber_id, message: 'Libri u shtua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    await Libri.update(req.params.id, req.body);
    res.json({ message: 'Libri u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Libri.remove(req.params.id);
    res.json({ message: 'Libri u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
