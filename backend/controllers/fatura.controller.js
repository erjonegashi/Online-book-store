'use strict';

const Fatura = require('../models/fatura.model');

exports.getAll = async (_req, res) => {
  try { res.json(await Fatura.getAll()); }
  catch (err) { console.error('[FaturaCtrl] getAll:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getById = async (req, res) => {
  try {
    const fatura = await Fatura.getById(req.params.id);
    if (!fatura) return res.status(404).json({ error: 'Fatura nuk u gjet' });
    res.json(fatura);
  } catch (err) { console.error('[FaturaCtrl] getById:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.create = async (req, res) => {
  const { porosi_id, shuma_total } = req.body;
  if (!porosi_id || !shuma_total)
    return res.status(400).json({ error: 'Porosia dhe shuma janë të detyrueshme' });
  try {
    const fatura_id = await Fatura.create(req.body);
    res.status(201).json({ fatura_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Numri i faturës ekziston tashmë' });
    console.error('[FaturaCtrl] create:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.update = async (req, res) => {
  try {
    await Fatura.update(req.params.id, req.body);
    res.json({ message: 'Fatura u azhurnua' });
  } catch (err) { console.error('[FaturaCtrl] update:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.remove = async (req, res) => {
  try {
    await Fatura.remove(req.params.id);
    res.json({ message: 'Fatura u fshi' });
  } catch (err) { console.error('[FaturaCtrl] remove:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};
