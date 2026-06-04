'use strict';

const router    = require('express').Router();
const ctrl      = require('../controllers/libri.controller');
const adminAuth = require('../middleware/adminAuth');

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/',    adminAuth, ctrl.create);
router.put('/:id',  adminAuth, ctrl.update);
router.delete('/:id', adminAuth, ctrl.remove);

module.exports = router;
