'use strict';

const router = require('express').Router();
const Stoku  = require('../models/stoku.model');

router.get('/', async (_req, res) => {
  try { res.json(await Stoku.getAll()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/liber/:liber_id', async (req, res) => {
  try { res.json(await Stoku.getByLiber(req.params.liber_id)); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const lëvizja = await Stoku.getById(req.params.id);
    if (!lëvizja) return res.status(404).json({ error: 'Lëvizja e stokut nuk u gjet' });
    res.json(lëvizja);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', async (req, res) => {
  const { liber_id, sasia_ndryshimit } = req.body;
  if (!liber_id || sasia_ndryshimit === undefined)
    return res.status(400).json({ error: 'Libri dhe sasia janë të detyrueshme' });
  try {
    const stok_id = await Stoku.create(req.body);
    res.status(201).json({ stok_id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    await Stoku.update(req.params.id, req.body);
    res.json({ message: 'Lëvizja e stokut u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Stoku.remove(req.params.id);
    res.json({ message: 'Lëvizja e stokut u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
