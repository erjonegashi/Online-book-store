'use strict';

const router = require('express').Router();
const Fatura = require('../models/fatura.model');

router.get('/', async (_req, res) => {
  try { res.json(await Fatura.getAll()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const fatura = await Fatura.getById(req.params.id);
    if (!fatura) return res.status(404).json({ error: 'Fatura nuk u gjet' });
    res.json(fatura);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { porosi_id, shuma_total } = req.body;
  if (!porosi_id || !shuma_total)
    return res.status(400).json({ error: 'Porosia dhe shuma janë të detyrueshme' });
  try {
    const fatura_id = await Fatura.create(req.body);
    res.status(201).json({ fatura_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Numri i faturës ekziston tashmë' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await Fatura.update(req.params.id, req.body);
    res.json({ message: 'Fatura u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Fatura.remove(req.params.id);
    res.json({ message: 'Fatura u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
