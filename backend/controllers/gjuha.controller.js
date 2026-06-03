'use strict';

const Gjuha = require('../models/gjuha.model');

exports.getAll = async (_req, res) => {
  try { res.json(await Gjuha.getAll()); }
  catch (err) { console.error('[GjuhetCtrl] getAll:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getById = async (req, res) => {
  try {
    const gjuha = await Gjuha.getById(req.params.id);
    if (!gjuha) return res.status(404).json({ error: 'Gjuha nuk u gjet' });
    res.json(gjuha);
  } catch (err) { console.error('[GjuhetCtrl] getById:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.create = async (req, res) => {
  if (!req.body.emri)
    return res.status(400).json({ error: 'Emri i gjuhës është i detyrueshëm' });
  try {
    const gjuhe_id = await Gjuha.create(req.body);
    res.status(201).json({ gjuhe_id });
  } catch (err) { console.error('[GjuhetCtrl] create:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.update = async (req, res) => {
  if (!req.body.emri)
    return res.status(400).json({ error: 'Emri i gjuhës është i detyrueshëm' });
  try {
    await Gjuha.update(req.params.id, req.body);
    res.json({ message: 'Gjuha u azhurnua' });
  } catch (err) { console.error('[GjuhetCtrl] update:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.remove = async (req, res) => {
  try {
    await Gjuha.remove(req.params.id);
    res.json({ message: 'Gjuha u fshi' });
  } catch (err) { console.error('[GjuhetCtrl] remove:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};
