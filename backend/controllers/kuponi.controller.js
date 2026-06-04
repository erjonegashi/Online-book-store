'use strict';

const Kuponi = require('../models/kuponi.model');

exports.getAll = async (_req, res) => {
  try { res.json(await Kuponi.getAll()); }
  catch (err) { console.error('[KuponiCtrl] getAll:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getById = async (req, res) => {
  try {
    const kuponi = await Kuponi.getById(req.params.id);
    if (!kuponi) return res.status(404).json({ error: 'Kuponi nuk u gjet' });
    res.json(kuponi);
  } catch (err) { console.error('[KuponiCtrl] getById:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.getByKodi = async (req, res) => {
  try {
    const kuponi = await Kuponi.getByKodi(req.params.kodi);
    if (!kuponi) return res.status(404).json({ error: 'Kuponi jo i vlefshëm' });
    res.json(kuponi);
  } catch (err) { console.error('[KuponiCtrl] getByKodi:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.create = async (req, res) => {
  const { kodi, perqindja_zbritjes } = req.body;
  if (!kodi || !perqindja_zbritjes)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  if (Number(perqindja_zbritjes) < 0 || Number(perqindja_zbritjes) > 100)
    return res.status(400).json({ error: 'Përqindja duhet të jetë ndërmjet 0 dhe 100' });
  try {
    const kupon_id = await Kuponi.create(req.body);
    res.status(201).json({ kupon_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Kodi ekziston tashmë' });
    console.error('[KuponiCtrl] create:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
};

exports.update = async (req, res) => {
  try {
    await Kuponi.update(req.params.id, req.body);
    res.json({ message: 'Kuponi u azhurnua' });
  } catch (err) { console.error('[KuponiCtrl] update:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};

exports.remove = async (req, res) => {
  try {
    await Kuponi.remove(req.params.id);
    res.json({ message: 'Kuponi u fshi' });
  } catch (err) { console.error('[KuponiCtrl] remove:', err.message); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
};
