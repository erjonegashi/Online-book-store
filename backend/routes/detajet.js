'use strict';

const router = require('express').Router();
const Detaji = require('../models/detaji.model');
const auth   = require('../middleware/auth');

router.get('/', async (_req, res) => {
  try { res.json(await Detaji.getAll()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/porosi/:porosi_id', async (req, res) => {
  try { res.json(await Detaji.getByPorosi(req.params.porosi_id)); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', auth, async (req, res) => {
  const { porosi_id, liber_id, sasia, cmimi_njesi } = req.body;
  if (!porosi_id || !liber_id || !sasia || !cmimi_njesi)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const detaji_id = await Detaji.create(req.body);
    res.status(201).json({ detaji_id, message: 'Detaji u shtua' });
  } catch (err) {
    if (err.status === 400 || err.status === 404)
      return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await Detaji.update(req.params.id, req.body);
    res.json({ message: 'Detaji u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Detaji.remove(req.params.id);
    res.json({ message: 'Detaji u fshi' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
