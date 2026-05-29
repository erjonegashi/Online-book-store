'use strict';

const router = require('express').Router();
const Kuponi = require('../models/kuponi.model');

router.get('/', async (_req, res) => {
  try { res.json(await Kuponi.getAll()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const kuponi = await Kuponi.getById(req.params.id);
    if (!kuponi) return res.status(404).json({ error: 'Kuponi nuk u gjet' });
    res.json(kuponi);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/kodi/:kodi', async (req, res) => {
  try {
    const kuponi = await Kuponi.getByKodi(req.params.kodi);
    if (!kuponi) return res.status(404).json({ error: 'Kuponi jo i vlefshëm' });
    res.json(kuponi);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', async (req, res) => {
  const { kodi, perqindja_zbritjes } = req.body;
  if (!kodi || !perqindja_zbritjes)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const kupon_id = await Kuponi.create(req.body);
    res.status(201).json({ kupon_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Kodi ekziston tashmë' });
    console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await Kuponi.update(req.params.id, req.body);
    res.json({ message: 'Kuponi u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Kuponi.remove(req.params.id);
    res.json({ message: 'Kuponi u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
