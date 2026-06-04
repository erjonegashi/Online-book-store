'use strict';

const Adresa = require('../models/adresa.model');

exports.getAll = async (_req, res) => {
  try { res.json(await Adresa.getAll()); }
  catch (err) { console.error('[AdresaCtrl] getAll:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getByKlient = async (req, res) => {
  try { res.json(await Adresa.getByKlient(req.params.klient_id)); }
  catch (err) { console.error('[AdresaCtrl] getByKlient:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.create = async (req, res) => {
  const { klient_id, adresa, qyteti } = req.body;
  if (!klient_id || !adresa || !qyteti)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const adrese_id = await Adresa.create(req.body);
    res.status(201).json({ adrese_id });
  } catch (err) { console.error('[AdresaCtrl] create:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.update = async (req, res) => {
  try {
    await Adresa.update(req.params.id, req.body);
    res.json({ message: 'Adresa u azhurnua' });
  } catch (err) { console.error('[AdresaCtrl] update:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.remove = async (req, res) => {
  try {
    await Adresa.remove(req.params.id);
    res.json({ message: 'Adresa u fshi' });
  } catch (err) { console.error('[AdresaCtrl] remove:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};
