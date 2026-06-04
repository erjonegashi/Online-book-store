'use strict';

const Porosi = require('../models/porosi.model');

const VALID_STATUSET = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const VALID_METODAT  = ['Cash', 'Card', 'PayPal', 'Bank Transfer'];

exports.getAll = async (_req, res) => {
  try {
    res.json(await Porosi.getAll());
  } catch (err) {
    console.error('[PorosiCtrl] getAll:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const porosi = await Porosi.getById(req.params.id);
    if (!porosi) return res.status(404).json({ error: 'Porosia nuk u gjet' });
    res.json(porosi);
  } catch (err) {
    console.error('[PorosiCtrl] getById:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.create = async (req, res) => {
  const { shuma_totale } = req.body;
  if (!shuma_totale)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  if (Number(shuma_totale) < 0)
    return res.status(400).json({ error: 'Shuma totale nuk mund të jetë negative' });
  try {
    // klient_id vjen nga token-i i autentikimit — nuk pranohet nga body
    const porosi_id = await Porosi.create({ ...req.body, klient_id: req.user.id });
    res.status(201).json({ porosi_id, message: 'Porosia u shtua' });
  } catch (err) {
    console.error('[PorosiCtrl] create:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.update = async (req, res) => {
  const { statusi, metoda_pageses } = req.body;
  if (statusi && !VALID_STATUSET.includes(statusi))
    return res.status(400).json({ error: `Statusi "${statusi}" nuk është i vlefshëm` });
  if (metoda_pageses && !VALID_METODAT.includes(metoda_pageses))
    return res.status(400).json({ error: `Metoda "${metoda_pageses}" nuk është e vlefshme` });
  try {
    // Merr të dhënat ekzistuese dhe bashkoji me ndryshimet e dërguara (partial update)
    const existing = await Porosi.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Porosia nuk u gjet' });
    await Porosi.update(req.params.id, { ...existing, ...req.body });
    res.json({ message: 'Porosia u azhurnua' });
  } catch (err) {
    console.error('[PorosiCtrl] update:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.remove = async (req, res) => {
  try {
    await Porosi.remove(req.params.id);
    res.json({ message: 'Porosia u fshi' });
  } catch (err) {
    console.error('[PorosiCtrl] remove:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};
