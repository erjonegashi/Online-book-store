'use strict';

const router = require('express').Router();
const Adresa = require('../models/adresa.model');

router.get('/', async (_req, res) => {
  try { res.json(await Adresa.getAll()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/klient/:klient_id', async (req, res) => {
  try { res.json(await Adresa.getByKlient(req.params.klient_id)); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', async (req, res) => {
  const { klient_id, adresa, qyteti } = req.body;
  if (!klient_id || !adresa || !qyteti)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const adrese_id = await Adresa.create(req.body);
    res.status(201).json({ adrese_id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    await Adresa.update(req.params.id, req.body);
    res.json({ message: 'Adresa u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Adresa.remove(req.params.id);
    res.json({ message: 'Adresa u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
