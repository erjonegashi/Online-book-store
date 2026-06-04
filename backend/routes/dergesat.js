'use strict';

const router    = require('express').Router();
const ctrl      = require('../controllers/dergesa.controller');
const auth      = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.get('/',    adminAuth, ctrl.getAll);
router.get('/:id', auth,      ctrl.getById);
router.post('/',   auth,      ctrl.create);
router.put('/:id', adminAuth, ctrl.update);
router.delete('/:id', adminAuth, ctrl.remove);

module.exports = router;
