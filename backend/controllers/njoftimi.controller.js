'use strict';

const Njoftimi = require('../models/njoftimi.model');

exports.getAll = async (_req, res) => {
  try { res.json(await Njoftimi.getAll()); }
  catch (err) { console.error('[NjoftimiCtrl] getAll:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getByKlient = async (req, res) => {
  try { res.json(await Njoftimi.getByKlient(req.params.klient_id)); }
  catch (err) { console.error('[NjoftimiCtrl] getByKlient:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getById = async (req, res) => {
  try {
    const njoftimi = await Njoftimi.getById(req.params.id);
    if (!njoftimi) return res.status(404).json({ error: 'Njoftimi nuk u gjet' });
    res.json(njoftimi);
  } catch (err) { console.error('[NjoftimiCtrl] getById:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.create = async (req, res) => {
  const { titulli, mesazhi } = req.body;
  if (!titulli || !mesazhi)
    return res.status(400).json({ error: 'Titulli dhe mesazhi janë të detyrueshëm' });
  try {
    const njoftime_id = await Njoftimi.create(req.body);
    res.status(201).json({ njoftime_id });
  } catch (err) { console.error('[NjoftimiCtrl] create:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.update = async (req, res) => {
  try {
    await Njoftimi.update(req.params.id, req.body);
    res.json({ message: 'Njoftimi u azhurnua' });
  } catch (err) { console.error('[NjoftimiCtrl] update:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.remove = async (req, res) => {
  try {
    await Njoftimi.remove(req.params.id);
    res.json({ message: 'Njoftimi u fshi' });
  } catch (err) { console.error('[NjoftimiCtrl] remove:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};
