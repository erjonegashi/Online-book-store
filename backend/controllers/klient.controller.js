'use strict';

const Klient = require('../models/klient.model');

exports.getAll = async (_req, res) => {
  try { res.json(await Klient.getAll()); }
  catch (err) { console.error('[KlientCtrl] getAll:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getById = async (req, res) => {
  try {
    const klient = await Klient.getById(req.params.id);
    if (!klient) return res.status(404).json({ error: 'Klienti nuk u gjet' });
    res.json(klient);
  } catch (err) { console.error('[KlientCtrl] getById:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getOrders = async (req, res) => {
  try { res.json(await Klient.getOrders(req.params.id)); }
  catch (err) { console.error('[KlientCtrl] getOrders:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.create = async (req, res) => {
  const { emri, mbiemri, email, password } = req.body;
  if (!emri || !mbiemri || !email || !password)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const klient_id = await Klient.create(req.body);
    res.status(201).json({ klient_id, message: 'Klienti u shtua' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email ekziston tashmë' });
    console.error('[KlientCtrl] create:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.update = async (req, res) => {
  try {
    await Klient.update(req.params.id, req.body);
    res.json({ message: 'Klienti u azhurnua' });
  } catch (err) { console.error('[KlientCtrl] update:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.remove = async (req, res) => {
  try {
    await Klient.remove(req.params.id);
    res.json({ message: 'Klienti u fshi' });
  } catch (err) { console.error('[KlientCtrl] remove:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};
