'use strict';

const router = require('express').Router();
const Stats  = require('../models/stats.model');

router.get('/', async (_req, res) => {
  try { res.json(await Stats.getDashboard()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Kërkesa dështoi. Provo përsëri.' }); }
});

module.exports = router;
