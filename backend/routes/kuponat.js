'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/kuponi.controller');

router.get('/',              ctrl.getAll);
router.get('/kodi/:kodi',    ctrl.getByKodi);
router.get('/:id',           ctrl.getById);
router.post('/',             ctrl.create);
router.put('/:id',           ctrl.update);
router.delete('/:id',        ctrl.remove);

module.exports = router;
