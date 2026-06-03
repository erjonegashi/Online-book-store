'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt    = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET is not set in environment. Refusing to start.');
  process.exit(1);
}

const jwtSecret = () => process.env.JWT_SECRET;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

module.exports = {
  hashPassword:         pw           => bcrypt.hash(pw, 10),
  comparePassword:      (pw, hash)   => bcrypt.compare(pw, hash),
  signToken:            payload      => jwt.sign(payload, jwtSecret(), { expiresIn: '15m' }),
  verifyToken:          token        => jwt.verify(token, jwtSecret()),
  generateToken:        ()           => crypto.randomBytes(32).toString('hex'),
  generateRefreshToken: ()           => crypto.randomBytes(64).toString('hex'),
  REFRESH_TOKEN_TTL_MS,
  tokenExpiresAt:       (hours = 1)  => new Date(Date.now() + hours * 60 * 60 * 1000),
};
