'use strict';

const db          = require('../config/db');
const authService = require('../services/auth.service');

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── POST /api/admin/auth/register ─────────────────────────────────────────────

exports.register = async (req, res) => {
  const { emri, mbiemri, email, password } = req.body;
  const emailNorm = (email || '').toLowerCase().trim();
  console.log(`[AdminAuth] Register attempt: ${emailNorm}`);

  try {
    if (!emri || !mbiemri || !email || !password)
      return res.status(400).json({ error: 'All fields are required.' });

    if (!VALID_EMAIL.test(emailNorm))
      return res.status(400).json({ error: 'Please enter a valid email address.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const hash = await authService.hashPassword(password);

    const [result] = await db.query(
      `INSERT INTO Adminet (emri, mbiemri, email, fjalekalimi_hash, roli)
       VALUES (?, ?, ?, ?, 'admin')`,
      [emri.trim(), mbiemri.trim(), emailNorm, hash]
    );

    const token = authService.signToken({
      id:      result.insertId,
      email:   emailNorm,
      emri:    emri.trim(),
      mbiemri: mbiemri.trim(),
      roli:    'admin',
    });

    console.log(`[AdminAuth] Register: admin created id=${result.insertId} email=${emailNorm}`);

    return res.status(201).json({
      token,
      user: {
        id:      result.insertId,
        emri:    emri.trim(),
        mbiemri: mbiemri.trim(),
        email:   emailNorm,
        roli:    'admin',
      },
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.warn(`[AdminAuth] Register: duplicate email ${emailNorm}`);
      return res.status(409).json({ error: 'An admin account with this email already exists.' });
    }
    console.error('[AdminAuth] Register error:', err.message);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ── POST /api/admin/auth/login ────────────────────────────────────────────────

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const emailNorm = (email || '').toLowerCase().trim();
  console.log(`[AdminAuth] Login attempt: ${emailNorm}`);

  try {
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const [rows] = await db.query('SELECT * FROM Adminet WHERE email = ?', [emailNorm]);

    if (!rows.length) {
      console.warn(`[AdminAuth] Login: not found ${emailNorm}`);
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const admin = rows[0];

    const match = await authService.comparePassword(password, admin.fjalekalimi_hash);
    if (!match) {
      console.warn(`[AdminAuth] Login: wrong password for ${emailNorm}`);
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const token = authService.signToken({
      id:      admin.admin_id,
      email:   admin.email,
      emri:    admin.emri,
      mbiemri: admin.mbiemri,
      roli:    'admin',
    });

    console.log(`[AdminAuth] Login: success id=${admin.admin_id} email=${admin.email}`);

    return res.json({
      token,
      user: {
        id:      admin.admin_id,
        emri:    admin.emri,
        mbiemri: admin.mbiemri,
        email:   admin.email,
        roli:    'admin',
      },
    });

  } catch (err) {
    console.error('[AdminAuth] Login error:', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ── GET /api/admin/auth/me ────────────────────────────────────────────────────

exports.me = (req, res) => {
  res.json({ admin: req.admin });
};
