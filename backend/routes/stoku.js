'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/stoku.controller');

router.get('/',                  ctrl.getAll);
router.get('/liber/:liber_id',   ctrl.getByLiber);
router.get('/:id',               ctrl.getById);
router.post('/',                 ctrl.create);
router.put('/:id',               ctrl.update);
router.delete('/:id',            ctrl.remove);

module.exports = router;
