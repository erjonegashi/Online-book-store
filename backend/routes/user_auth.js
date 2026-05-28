'use strict';

const router      = require('express').Router();
const ctrl        = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

router.get ('/me',              authMiddleware, ctrl.me);
router.post('/forgot-password', ctrl.forgotPassword);
router.put ('/reset-password',  ctrl.resetPassword);

module.exports = router;
