'use strict';

const router    = require('express').Router();
const auth      = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const ctrl      = require('../controllers/adresa.controller');

router.get('/',                  adminAuth, ctrl.getAll);
router.get('/klient/:klient_id', auth,      ctrl.getByKlient);
router.post('/',                 auth,      ctrl.create);
router.put('/:id',               auth,      ctrl.update);
router.delete('/:id',            auth,      ctrl.remove);

module.exports = router;
