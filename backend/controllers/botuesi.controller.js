'use strict';

const Botuesi = require('../models/botuesi.model');

exports.getAll = async (_req, res) => {
  try { res.json(await Botuesi.getAll()); }
  catch (err) { console.error('[BotuesitCtrl] getAll:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getById = async (req, res) => {
  try {
    const botuesi = await Botuesi.getById(req.params.id);
    if (!botuesi) return res.status(404).json({ error: 'Botuesi nuk u gjet' });
    res.json(botuesi);
  } catch (err) { console.error('[BotuesitCtrl] getById:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.create = async (req, res) => {
  if (!req.body.emri)
    return res.status(400).json({ error: 'Emri i botuesit është i detyrueshëm' });
  try {
    const botues_id = await Botuesi.create(req.body);
    res.status(201).json({ botues_id });
  } catch (err) { console.error('[BotuesitCtrl] create:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.update = async (req, res) => {
  if (!req.body.emri)
    return res.status(400).json({ error: 'Emri i botuesit është i detyrueshëm' });
  try {
    await Botuesi.update(req.params.id, req.body);
    res.json({ message: 'Botuesi u azhurnua' });
  } catch (err) { console.error('[BotuesitCtrl] update:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.remove = async (req, res) => {
  try {
    await Botuesi.remove(req.params.id);
    res.json({ message: 'Botuesi u fshi' });
  } catch (err) { console.error('[BotuesitCtrl] remove:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};
