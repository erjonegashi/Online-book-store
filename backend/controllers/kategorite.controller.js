'use strict';

const Kategoria = require('../models/kategorite.model');

exports.getAll = async (_req, res) => {
  try {
    res.json(await Kategoria.getAll());
  } catch (err) {
    console.error('[KategoriteCtrl] getAll:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const kategoria = await Kategoria.getById(req.params.id);
    if (!kategoria) return res.status(404).json({ error: 'Kategoria nuk u gjet' });
    res.json(kategoria);
  } catch (err) {
    console.error('[KategoriteCtrl] getById:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.create = async (req, res) => {
  if (!req.body.emri)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const kategori_id = await Kategoria.create(req.body);
    res.status(201).json({ kategori_id, message: 'Kategoria u shtua' });
  } catch (err) {
    console.error('[KategoriteCtrl] create:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.update = async (req, res) => {
  try {
    await Kategoria.update(req.params.id, req.body);
    res.json({ message: 'Kategoria u azhurnua' });
  } catch (err) {
    console.error('[KategoriteCtrl] update:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.remove = async (req, res) => {
  try {
    await Kategoria.remove(req.params.id);
    res.json({ message: 'Kategoria u fshi' });
  } catch (err) {
    console.error('[KategoriteCtrl] remove:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};
