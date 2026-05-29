'use strict';

const router     = require('express').Router();
const Promocioni = require('../models/promocioni.model');

router.get('/', async (_req, res) => {
  try { res.json(await Promocioni.getAll()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const promocioni = await Promocioni.getById(req.params.id);
    if (!promocioni) return res.status(404).json({ error: 'Promovimi nuk u gjet' });
    res.json(promocioni);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', async (req, res) => {
  const { titulli, perqindja_zbritjes } = req.body;
  if (!titulli) return res.status(400).json({ error: 'Titulli është i detyrueshëm' });
  if (!perqindja_zbritjes) return res.status(400).json({ error: 'Përqindja e zbritjes është e detyrueshme' });
  try {
    const promovim_id = await Promocioni.create(req.body);
    res.status(201).json({ promovim_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Kodi i promovimit ekziston tashmë' });
    console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
});

router.put('/:id', async (req, res) => {
  if (!req.body.titulli)
    return res.status(400).json({ error: 'Titulli është i detyrueshëm' });
  try {
    await Promocioni.update(req.params.id, req.body);
    res.json({ message: 'Promovimi u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Promocioni.remove(req.params.id);
    res.json({ message: 'Promovimi u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
