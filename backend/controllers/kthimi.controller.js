'use strict';

const Kthimi = require('../models/kthimi.model');

const VALID_GJENDJA = ['Pending', 'Approved', 'Completed', 'Rejected'];

exports.getAll = async (_req, res) => {
  try { res.json(await Kthimi.getAll()); }
  catch (err) { console.error('[KthimiCtrl] getAll:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getById = async (req, res) => {
  try {
    const kthimi = await Kthimi.getById(req.params.id);
    if (!kthimi) return res.status(404).json({ error: 'Kthimi nuk u gjet' });
    res.json(kthimi);
  } catch (err) { console.error('[KthimiCtrl] getById:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.create = async (req, res) => {
  const { porosi_id, arsyeja } = req.body;
  if (!porosi_id || !arsyeja)
    return res.status(400).json({ error: 'Porosia dhe arsyeja janë të detyrueshme' });
  try {
    const kthim_id = await Kthimi.create(req.body);
    res.status(201).json({ kthim_id });
  } catch (err) { console.error('[KthimiCtrl] create:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.update = async (req, res) => {
  const { gjendja } = req.body;
  if (gjendja && !VALID_GJENDJA.includes(gjendja))
    return res.status(400).json({ error: `Gjendja "${gjendja}" nuk është e vlefshme` });
  try {
    await Kthimi.update(req.params.id, req.body);
    res.json({ message: 'Kthimi u azhurnua' });
  } catch (err) { console.error('[KthimiCtrl] update:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.remove = async (req, res) => {
  try {
    await Kthimi.remove(req.params.id);
    res.json({ message: 'Kthimi u fshi' });
  } catch (err) { console.error('[KthimiCtrl] remove:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};
