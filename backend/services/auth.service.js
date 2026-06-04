'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt    = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET is not set in environment. Refusing to start.');
  process.exit(1);
}

const JWT_MIN_SECRET_LENGTH = 32;
if (process.env.JWT_SECRET.length < JWT_MIN_SECRET_LENGTH) {
  console.error(`[FATAL] JWT_SECRET is too short (min ${JWT_MIN_SECRET_LENGTH} chars). Refusing to start.`);
  process.exit(1);
}

// Reject placeholder and low-entropy values
const JWT_WEAK_PATTERNS = [
  /placeholder/i,
  /change[_-]?me/i,
  /your[_-]?secret/i,
  /example/i,
  /random[_-]?string/i,
  /make[_-]?it[_-]?long/i,
  /replace[_-]?me/i,
  /jwt[_-]?secret/i,
  /test[_-]?secret/i,
  /^[a-zA-Z_]+$/,   // purely alphabetic phrase — no digits or special chars
];
if (JWT_WEAK_PATTERNS.some(p => p.test(process.env.JWT_SECRET))) {
  console.error('[FATAL] JWT_SECRET looks like a placeholder or weak value.');
  console.error('[FATAL] Generate a real secret: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"');
  process.exit(1);
}

const jwtSecret = () => process.env.JWT_SECRET;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// SHA-256 hash — ruaj në DB, jo plaintext
const hashRefreshToken = token =>
  crypto.createHash('sha256').update(token).digest('hex');

module.exports = {
  hashPassword:         pw           => bcrypt.hash(pw, 10),
  comparePassword:      (pw, hash)   => bcrypt.compare(pw, hash),
  signToken:            payload      => jwt.sign(payload, jwtSecret(), { expiresIn: '15m' }),
  verifyToken:          token        => jwt.verify(token, jwtSecret()),
  generateToken:        ()           => crypto.randomBytes(32).toString('hex'),
  generateRefreshToken: ()           => crypto.randomBytes(64).toString('hex'),
  hashRefreshToken,
  REFRESH_TOKEN_TTL_MS,
  tokenExpiresAt:       (hours = 1)  => new Date(Date.now() + hours * 60 * 60 * 1000),
};
