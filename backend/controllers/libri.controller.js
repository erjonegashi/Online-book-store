'use strict';

const Libri = require('../models/libri.model');

exports.getAll = async (req, res) => {
  try {
    const librat = await Libri.getAll(req.query.search);
    res.json(librat);
  } catch (err) {
    console.error('[LibriCtrl] getAll:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const libri = await Libri.getById(req.params.id);
    if (!libri) return res.status(404).json({ error: 'Libri nuk u gjet' });
    res.json(libri);
  } catch (err) {
    console.error('[LibriCtrl] getById:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.create = async (req, res) => {
  const { titulli, cmimi } = req.body;
  if (!titulli || cmimi === undefined || cmimi === null || cmimi === '')
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  if (Number(cmimi) < 0)
    return res.status(400).json({ error: 'Çmimi nuk mund të jetë negativ' });
  try {
    const liber_id = await Libri.create(req.body);
    res.status(201).json({ liber_id, message: 'Libri u shtua' });
  } catch (err) {
    console.error('[LibriCtrl] create:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.update = async (req, res) => {
  try {
    await Libri.update(req.params.id, req.body);
    res.json({ message: 'Libri u azhurnua' });
  } catch (err) {
    console.error('[LibriCtrl] update:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.remove = async (req, res) => {
  try {
    await Libri.remove(req.params.id);
    res.json({ message: 'Libri u fshi' });
  } catch (err) {
    console.error('[LibriCtrl] remove:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};
