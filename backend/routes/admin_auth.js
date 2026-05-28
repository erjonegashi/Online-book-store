'use strict';

const router    = require('express').Router();
const ctrl      = require('../controllers/adminAuth.controller');
const adminAuth = require('../middleware/adminAuth');

router.post('/register', adminAuth, ctrl.register);
router.post('/login',             ctrl.login);
router.get ('/me',                adminAuth, ctrl.me);
router.put ('/change-password',   adminAuth, ctrl.changePassword);
router.post('/forgot-password',   ctrl.forgotPassword);
router.put ('/reset-password',    ctrl.resetPassword);

module.exports = router;
