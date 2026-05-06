'use strict';

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const db     = require('../config/db');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLoginNotification,
} = require('../utils/mailer');

// ── Helpers ───────────────────────────────────────────────────────────────────

const UBT       = '@ubt-uni.net';
const isUBT     = email => typeof email === 'string' && email.toLowerCase().endsWith(UBT);
const mkToken   = ()    => crypto.randomBytes(32).toString('hex');
const jwtSecret = ()    => process.env.JWT_SECRET || 'bookstore_secret';
const JWT_OPTS  = { expiresIn: '24h' };

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  const { emri, mbiemri, email, password, telefoni, adresa, qyteti, kodi_postar } = req.body;
  console.log(`[Auth] Register: ${email}`);

  try {
    if (!emri || !mbiemri || !email || !password)
      return res.status(400).json({ error: 'Please fill in all required fields.' });

    if (!isUBT(email))
      return res.status(403).json({ error: 'Only @ubt-uni.net emails are allowed.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const hash  = await bcrypt.hash(password, 10);
    const token = mkToken();
    console.log(`[Auth] Register: token generated for ${email}`);

    const [result] = await db.query(
      `INSERT INTO Klientet
         (emri, mbiemri, email, fjalekalimi_hash,
          telefoni, adresa, qyteti, kodi_postar,
          email_verified, verification_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [emri, mbiemri, email, hash,
       telefoni || null, adresa || null, qyteti || null, kodi_postar || null,
       token]
    );
    console.log(`[Auth] Register: user created id=${result.insertId}`);

    // Try to send verification email — await so we know if it worked
    let emailResult = { delivered: false, devMode: false };
    let emailError  = null;

    try {
      emailResult = await sendVerificationEmail({ emri, mbiemri, email }, token);
    } catch (err) {
      emailError = err.message;
      console.error(`[Auth] Register: verification email FAILED for ${email}: ${err.message}`);
    }

    const jwtToken = jwt.sign(
      { id: result.insertId, email, emri, mbiemri },
      jwtSecret(), JWT_OPTS
    );

    return res.status(201).json({
      token:             jwtToken,
      user:              { id: result.insertId, emri, mbiemri, email },
      needsVerification: true,
      emailDelivered:    emailResult.delivered,
      emailDevMode:      emailResult.devMode,
      emailError:        emailError || undefined,
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.warn(`[Auth] Register: duplicate email ${email}`);
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    console.error('[Auth] Register error:', err.message);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── GET /api/auth/verify/:token ───────────────────────────────────────────────

router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;
  console.log(`[Auth] Verify email: token=${token.slice(0, 12)}…`);

  try {
    const [rows] = await db.query(
      'SELECT klient_id FROM Klientet WHERE verification_token = ?',
      [token]
    );

    if (!rows.length) {
      console.warn('[Auth] Verify: invalid or already-used token');
      return res.status(400).json({ error: 'This link is invalid or has already been used.' });
    }

    await db.query(
      'UPDATE Klientet SET email_verified = 1, verification_token = NULL WHERE klient_id = ?',
      [rows[0].klient_id]
    );
    console.log(`[Auth] Verify: success klient_id=${rows[0].klient_id}`);

    return res.json({ message: 'Email verified! You can now log in.' });

  } catch (err) {
    console.error('[Auth] Verify error:', err.message);
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// ── POST /api/auth/resend-verification ───────────────────────────────────────

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  console.log(`[Auth] Resend verification: ${email}`);

  try {
    if (!isUBT(email))
      return res.status(403).json({ error: 'Only @ubt-uni.net emails are allowed.' });

    const [rows] = await db.query('SELECT * FROM Klientet WHERE email = ?', [email]);

    if (!rows.length) {
      console.warn(`[Auth] Resend: not found ${email}`);
      return res.json({ message: 'If this email is registered and unverified, a new email will be sent.' });
    }

    const user = rows[0];
    if (user.email_verified)
      return res.status(400).json({ error: 'This account is already verified. You can log in.' });

    const newToken = mkToken();
    await db.query(
      'UPDATE Klientet SET verification_token = ? WHERE klient_id = ?',
      [newToken, user.klient_id]
    );
    console.log(`[Auth] Resend: new token saved for ${email}`);

    // Await — if SMTP is configured and fails, return an error so the user knows
    try {
      await sendVerificationEmail(
        { emri: user.emri, mbiemri: user.mbiemri, email },
        newToken
      );
    } catch (emailErr) {
      console.error(`[Auth] Resend: email FAILED for ${email}: ${emailErr.message}`);
      return res.status(500).json({
        error: 'Failed to send verification email. Please check SMTP settings or try again later.',
      });
    }

    return res.json({ message: 'A new verification email has been sent to your inbox.' });

  } catch (err) {
    console.error('[Auth] Resend error:', err.message);
    return res.status(500).json({ error: 'Failed to resend. Please try again.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`[Auth] Login: ${email}`);

  try {
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const [rows] = await db.query('SELECT * FROM Klientet WHERE email = ?', [email]);

    if (!rows.length) {
      console.warn(`[Auth] Login: not found ${email}`);
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.fjalekalimi_hash);

    if (!valid) {
      console.warn(`[Auth] Login: wrong password for ${email}`);
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    if (isUBT(email) && !user.email_verified) {
      console.warn(`[Auth] Login: unverified ${email}`);
      return res.status(403).json({
        error:             'Your email has not been verified yet.',
        needsVerification: true,
        email:             user.email,
      });
    }

    const token = jwt.sign(
      { id: user.klient_id, email: user.email, emri: user.emri, mbiemri: user.mbiemri },
      jwtSecret(), JWT_OPTS
    );
    console.log(`[Auth] Login: success id=${user.klient_id}`);

    // Login notification is fire-and-forget — never block login on email failure
    if (isUBT(user.email)) {
      sendLoginNotification({ emri: user.emri, mbiemri: user.mbiemri, email: user.email })
        .catch(err => console.error('[Auth] Login notification failed:', err.message));
    }

    return res.json({
      token,
      user: { id: user.klient_id, emri: user.emri, mbiemri: user.mbiemri, email: user.email },
    });

  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log(`[Auth] Forgot password: ${email}`);

  try {
    if (!email)
      return res.status(400).json({ error: 'Email is required.' });

    if (!isUBT(email))
      return res.status(403).json({ error: 'Only @ubt-uni.net emails are allowed.' });

    const [rows] = await db.query('SELECT * FROM Klientet WHERE email = ?', [email]);

    // Prevent email enumeration: same response whether email exists or not
    if (!rows.length) {
      console.warn(`[Auth] Forgot password: not registered ${email}`);
      return res.json({ message: 'If this email is registered, a reset link has been sent.' });
    }

    const user       = rows[0];
    const resetToken = mkToken();
    const expires    = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      'UPDATE Klientet SET reset_token = ?, reset_token_expires = ? WHERE klient_id = ?',
      [resetToken, expires, user.klient_id]
    );
    console.log(`[Auth] Forgot password: token saved, expires ${expires.toISOString()}`);

    // Await — if SMTP is configured and fails, tell the user immediately
    try {
      await sendPasswordResetEmail(
        { emri: user.emri, mbiemri: user.mbiemri, email: user.email },
        resetToken
      );
    } catch (emailErr) {
      console.error(`[Auth] Forgot password: email FAILED for ${email}: ${emailErr.message}`);
      return res.status(500).json({
        error: 'Failed to send reset email. Please check SMTP settings or try again later.',
      });
    }

    console.log(`[Auth] Forgot password: reset email sent to ${email}`);
    return res.json({ message: 'Password reset email sent! Check your inbox.' });

  } catch (err) {
    console.error('[Auth] Forgot password error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  console.log(`[Auth] Reset password: token=${(token || '').slice(0, 12)}…`);

  try {
    if (!token)
      return res.status(400).json({ error: 'Reset token is missing.' });

    if (!password || password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const [rows] = await db.query(
      'SELECT * FROM Klientet WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (!rows.length) {
      console.warn('[Auth] Reset password: invalid or expired token');
      return res.status(400).json({
        error:   'This reset link is invalid or has expired. Please request a new one.',
        expired: true,
      });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `UPDATE Klientet
          SET fjalekalimi_hash = ?, reset_token = NULL, reset_token_expires = NULL
        WHERE klient_id = ?`,
      [hash, rows[0].klient_id]
    );
    console.log(`[Auth] Reset password: success klient_id=${rows[0].klient_id}`);

    return res.json({ message: 'Password updated successfully! You can now log in.' });

  } catch (err) {
    console.error('[Auth] Reset password error:', err.message);
    return res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

module.exports = router;
