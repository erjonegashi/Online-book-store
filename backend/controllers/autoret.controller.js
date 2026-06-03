'use strict';

const Autor = require('../models/autoret.model');

exports.getAll = async (_req, res) => {
  try {
    res.json(await Autor.getAll());
  } catch (err) {
    console.error('[AutoretCtrl] getAll:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const autor = await Autor.getById(req.params.id);
    if (!autor) return res.status(404).json({ error: 'Autori nuk u gjet' });
    res.json(autor);
  } catch (err) {
    console.error('[AutoretCtrl] getById:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.create = async (req, res) => {
  const { emri, mbiemri } = req.body;
  if (!emri || !mbiemri)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const autori_id = await Autor.create(req.body);
    res.status(201).json({ autori_id, message: 'Autori u shtua' });
  } catch (err) {
    console.error('[AutoretCtrl] create:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.update = async (req, res) => {
  try {
    await Autor.update(req.params.id, req.body);
    res.json({ message: 'Autori u azhurnua' });
  } catch (err) {
    console.error('[AutoretCtrl] update:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.remove = async (req, res) => {
  try {
    await Autor.remove(req.params.id);
    res.json({ message: 'Autori u fshi' });
  } catch (err) {
    console.error('[AutoretCtrl] remove:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};
