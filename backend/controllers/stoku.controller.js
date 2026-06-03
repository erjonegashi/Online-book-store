'use strict';

const Stoku = require('../models/stoku.model');

exports.getAll = async (_req, res) => {
  try { res.json(await Stoku.getAll()); }
  catch (err) { console.error('[StokuCtrl] getAll:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getByLiber = async (req, res) => {
  try { res.json(await Stoku.getByLiber(req.params.liber_id)); }
  catch (err) { console.error('[StokuCtrl] getByLiber:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getById = async (req, res) => {
  try {
    const levizja = await Stoku.getById(req.params.id);
    if (!levizja) return res.status(404).json({ error: 'Lëvizja e stokut nuk u gjet' });
    res.json(levizja);
  } catch (err) { console.error('[StokuCtrl] getById:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.create = async (req, res) => {
  const { liber_id, sasia_ndryshimit } = req.body;
  if (!liber_id || sasia_ndryshimit === undefined)
    return res.status(400).json({ error: 'Libri dhe sasia janë të detyrueshme' });
  try {
    const stok_id = await Stoku.create(req.body);
    res.status(201).json({ stok_id });
  } catch (err) { console.error('[StokuCtrl] create:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.update = async (req, res) => {
  try {
    await Stoku.update(req.params.id, req.body);
    res.json({ message: 'Lëvizja e stokut u azhurnua' });
  } catch (err) { console.error('[StokuCtrl] update:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.remove = async (req, res) => {
  try {
    await Stoku.remove(req.params.id);
    res.json({ message: 'Lëvizja e stokut u fshi' });
  } catch (err) { console.error('[StokuCtrl] remove:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};
