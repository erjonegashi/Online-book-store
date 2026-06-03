'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/adresa.controller');

router.get('/',                    ctrl.getAll);
router.get('/klient/:klient_id',   ctrl.getByKlient);
router.post('/',                   ctrl.create);
router.put('/:id',                 ctrl.update);
router.delete('/:id',              ctrl.remove);

module.exports = router;
