'use strict';

const router    = require('express').Router();
const ctrl      = require('../controllers/kuponi.controller');
const auth      = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.get('/',           adminAuth, ctrl.getAll);
router.get('/kodi/:kodi', auth,      ctrl.getByKodi);
router.get('/:id',        adminAuth, ctrl.getById);
router.post('/',          adminAuth, ctrl.create);
router.put('/:id',        adminAuth, ctrl.update);
router.delete('/:id',     adminAuth, ctrl.remove);

module.exports = router;
