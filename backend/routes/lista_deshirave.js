'use strict';

const router         = require('express').Router();
const auth           = require('../middleware/auth');
const ListaDeshirave = require('../models/lista_deshirave.model');

router.get('/', auth, async (req, res) => {
  try { res.json(await ListaDeshirave.getByKlient(req.user.id)); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const deshira = await ListaDeshirave.getById(req.params.id);
    if (!deshira) return res.status(404).json({ error: 'Dëshira nuk u gjet' });
    res.json(deshira);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.post('/', auth, async (req, res) => {
  const { liber_id } = req.body;
  // klient_id merret nga JWT — jo nga body (parandalon privilege escalation)
  const klient_id = req.user.id;
  if (!liber_id)
    return res.status(400).json({ error: 'Fushat e detyrueshme mungojnë' });
  try {
    const deshire_id = await ListaDeshirave.create({ klient_id, liber_id });
    res.status(201).json({ deshire_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Tashmë ekziston' });
    console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const entry = await ListaDeshirave.getById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Dëshira nuk u gjet' });
    if (String(entry.klient_id) !== String(req.user.id))
      return res.status(403).json({ error: 'Nuk keni leje për këtë veprim' });
    await ListaDeshirave.update(req.params.id, req.body);
    res.json({ message: 'Lista e dëshirave u azhurnua' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await ListaDeshirave.getById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Dëshira nuk u gjet' });
    if (String(entry.klient_id) !== String(req.user.id))
      return res.status(403).json({ error: 'Nuk keni leje për këtë veprim' });
    await ListaDeshirave.remove(req.params.id);
    res.json({ message: 'U fshi nga lista' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
