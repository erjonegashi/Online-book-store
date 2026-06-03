'use strict';

const Pagesa = require('../models/pagesa.model');

exports.getAll = async (_req, res) => {
  try { res.json(await Pagesa.getAll()); }
  catch (err) { console.error('[PagesaCtrl] getAll:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getById = async (req, res) => {
  try {
    const pagesa = await Pagesa.getById(req.params.id);
    if (!pagesa) return res.status(404).json({ error: 'Pagesa nuk u gjet' });
    res.json(pagesa);
  } catch (err) { console.error('[PagesaCtrl] getById:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.create = async (req, res) => {
  const { porosi_id, shuma } = req.body;
  if (!porosi_id || !shuma)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const pagese_id = await Pagesa.create(req.body);
    res.status(201).json({ pagese_id });
  } catch (err) { console.error('[PagesaCtrl] create:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.update = async (req, res) => {
  try {
    await Pagesa.update(req.params.id, req.body);
    res.json({ message: 'Pagesa u azhurnua' });
  } catch (err) { console.error('[PagesaCtrl] update:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.remove = async (req, res) => {
  try {
    await Pagesa.remove(req.params.id);
    res.json({ message: 'Pagesa u fshi' });
  } catch (err) { console.error('[PagesaCtrl] remove:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};
