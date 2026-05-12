'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt    = require('jsonwebtoken');

const jwtSecret = () => process.env.JWT_SECRET || 'bookstore_secret';
const JWT_OPTS  = { expiresIn: '24h' };

module.exports = {
  hashPassword:    pw           => bcrypt.hash(pw, 10),
  comparePassword: (pw, hash)   => bcrypt.compare(pw, hash),
  signToken:       payload      => jwt.sign(payload, jwtSecret(), JWT_OPTS),
  verifyToken:     token        => jwt.verify(token, jwtSecret()),
  generateToken:   ()           => crypto.randomBytes(32).toString('hex'),
  tokenExpiresAt:  (hours = 1)  => new Date(Date.now() + hours * 60 * 60 * 1000),
};
