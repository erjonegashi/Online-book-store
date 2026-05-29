'use strict';

const router        = require('express').Router();
const ListaDeshirave = require('../models/lista_deshirave.model');

router.get('/', async (_req, res) => {
  try { res.json(await ListaDeshirave.getAll()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', async (req, res) => {
  const { klient_id, liber_id } = req.body;
  if (!klient_id || !liber_id)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const deshire_id = await ListaDeshirave.create(req.body);
    res.status(201).json({ deshire_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Tashmë ekziston' });
    console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const deshira = await ListaDeshirave.getById(req.params.id);
    if (!deshira) return res.status(404).json({ error: 'Dëshira nuk u gjet' });
    res.json(deshira);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    await ListaDeshirave.update(req.params.id, req.body);
    res.json({ message: 'Lista e dëshirave u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await ListaDeshirave.remove(req.params.id);
    res.json({ message: 'U fshi nga lista' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
