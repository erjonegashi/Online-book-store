'use strict';

const db          = require('../config/db');
const authService = require('../services/auth.service');

const UBT_DOMAIN = '@ubt-uni.net';
const isUBT      = email => typeof email === 'string' && email.toLowerCase().endsWith(UBT_DOMAIN);
const normalise  = raw   => (raw || '').toLowerCase().trim();

// ── POST /api/auth/register ───────────────────────────────────────────────────

exports.register = async (req, res) => {
  const { emri, mbiemri, email, password, telefoni, adresa, qyteti, kodi_postar } = req.body;
  const emailNorm = normalise(email);

  if (!emri || !mbiemri || !email || !password)
    return res.status(400).json({ error: 'Please fill in all required fields.' });

  if (!isUBT(emailNorm))
    return res.status(403).json({ error: 'Only @ubt-uni.net email addresses are allowed to register.' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  try {
    const hash = await authService.hashPassword(password);

    const [result] = await db.query(
      `INSERT INTO Klientet
         (emri, mbiemri, email, fjalekalimi_hash, telefoni, adresa, qyteti, kodi_postar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [emri.trim(), mbiemri.trim(), emailNorm, hash,
       telefoni || null, adresa || null, qyteti || null, kodi_postar || null]
    );

    const token = authService.signToken({
      id: result.insertId, email: emailNorm,
      emri: emri.trim(), mbiemri: mbiemri.trim(),
    });

    return res.status(201).json({
      token,
      user: { id: result.insertId, emri: emri.trim(), mbiemri: mbiemri.trim(), email: emailNorm },
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'An account with this email already exists.' });
    console.error('[Auth] Register error:', err.message);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const emailNorm = normalise(email);

  try {
    const [rows] = await db.query('SELECT * FROM Klientet WHERE email = ?', [emailNorm]);
    const user   = rows[0];

    if (!user || !(await authService.comparePassword(password, user.fjalekalimi_hash)))
      return res.status(401).json({ error: 'Incorrect email or password.' });

    const token = authService.signToken({
      id: user.klient_id, email: user.email,
      emri: user.emri, mbiemri: user.mbiemri,
    });

    return res.json({
      token,
      user: { id: user.klient_id, emri: user.emri, mbiemri: user.mbiemri, email: user.email },
    });

  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ── POST /api/user/auth/forgot-password ──────────────────────────────────────

exports.forgotPassword = async (req, res) => {
  const email    = normalise(req.body.email);
  const SAFE_MSG = 'If an account with that email exists, a reset link has been logged to the server console.';

  if (!email)
    return res.status(400).json({ error: 'Email is required.' });

  try {
    const [rows] = await db.query('SELECT klient_id FROM Klientet WHERE email = ?', [email]);

    if (rows.length) {
      const token  = authService.generateToken();
      const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await db.query(
        'UPDATE Klientet SET reset_token = ?, reset_token_expiry = ? WHERE klient_id = ?',
        [token, expiry, rows[0].klient_id]
      );

      const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
      console.log(`[USER RESET] Link  : ${link}`);
      console.log(`[USER RESET] Expiry: ${expiry.toISOString()}`);
      console.log('Password reset link:', link);
    }

    return res.json({ message: SAFE_MSG });

  } catch (err) {
    console.error('[Auth] forgotPassword error:', err.message);
    return res.status(500).json({ error: 'Request failed. Please try again.' });
  }
};

// ── PUT /api/user/auth/reset-password ─────────────────────────────────────────

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res.status(400).json({ error: 'Token and new password are required.' });

  if (newPassword.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  try {
    const [rows] = await db.query(
      'SELECT klient_id, reset_token_expiry FROM Klientet WHERE reset_token = ?',
      [token]
    );

    if (!rows.length)
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' });

    if (new Date() > new Date(rows[0].reset_token_expiry))
      return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' });

    const hash = await authService.hashPassword(newPassword);

    await db.query(
      'UPDATE Klientet SET fjalekalimi_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE klient_id = ?',
      [hash, rows[0].klient_id]
    );

    return res.json({ message: 'Password reset successfully. You can now log in.' });

  } catch (err) {
    console.error('[Auth] resetPassword error:', err.message);
    return res.status(500).json({ error: 'Reset failed. Please try again.' });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

exports.me = (req, res) => res.json({ user: req.user });
