'use strict';

const router    = require('express').Router();
const ctrl      = require('../controllers/adminAuth.controller');
const adminAuth = require('../middleware/adminAuth');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.get ('/me',       adminAuth, ctrl.me);

module.exports = router;
