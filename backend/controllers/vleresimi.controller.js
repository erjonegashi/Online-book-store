'use strict';

const Vleresimi = require('../models/vleresimi.model');

const VALID_STATUSET = ['Pending', 'Approved', 'Rejected'];

exports.getAll = async (req, res) => {
  try {
    res.json(await Vleresimi.getAll(req.query.liber_id));
  } catch (err) {
    console.error('[VleresimiCtrl] getAll:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.create = async (req, res) => {
  const { liber_id, nota } = req.body;
  if (!liber_id || !nota)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  if (nota < 1 || nota > 5)
    return res.status(400).json({ error: 'Nota duhet të jetë ndërmjet 1 dhe 5' });
  try {
    // klient_id vjen nga JWT — nuk pranohet nga body
    const vleresim_id = await Vleresimi.create({ ...req.body, klient_id: req.user.id });
    res.status(201).json({ vleresim_id });
  } catch (err) {
    console.error('[VleresimiCtrl] create:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.update = async (req, res) => {
  const { statusi } = req.body;
  if (statusi && !VALID_STATUSET.includes(statusi))
    return res.status(400).json({ error: `Statusi "${statusi}" nuk është i vlefshëm` });
  try {
    // Merr të dhënat ekzistuese dhe bashkoji me ndryshimet (partial update)
    const existing = await Vleresimi.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Vlerësimi nuk u gjet' });
    await Vleresimi.update(req.params.id, { ...existing, ...req.body });
    res.json({ message: 'Vlerësimi u azhurnua' });
  } catch (err) {
    console.error('[VleresimiCtrl] update:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.remove = async (req, res) => {
  try {
    await Vleresimi.remove(req.params.id);
    res.json({ message: 'Vlerësimi u fshi' });
  } catch (err) {
    console.error('[VleresimiCtrl] remove:', err.message);
    res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};
