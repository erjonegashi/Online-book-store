'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/klient.controller');

router.get('/',                ctrl.getAll);
router.get('/:id',             ctrl.getById);
router.get('/:id/porosite',    ctrl.getOrders);
router.post('/',               ctrl.create);
router.put('/:id',             ctrl.update);
router.delete('/:id',          ctrl.remove);

module.exports = router;
