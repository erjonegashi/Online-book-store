'use strict';

const db          = require('../config/db');
const authService = require('../services/auth.service');

const UBT   = '@ubt-uni.net';
const isUBT = email => typeof email === 'string' && email.toLowerCase().endsWith(UBT);

// ── POST /api/auth/register ───────────────────────────────────────────────────

exports.register = async (req, res) => {
  const { emri, mbiemri, email, password, telefoni, adresa, qyteti, kodi_postar } = req.body;
  const emailNorm = (email || '').toLowerCase().trim();
  console.log(`[Auth] Register attempt: ${emailNorm}`);

  try {
    if (!emri || !mbiemri || !email || !password)
      return res.status(400).json({ error: 'Please fill in all required fields.' });

    if (!isUBT(emailNorm))
      return res.status(403).json({ error: 'Only @ubt-uni.net email addresses are allowed to register.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

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

    console.log(`[Auth] Register: success klient_id=${result.insertId} email=${emailNorm}`);

    return res.status(201).json({
      token,
      user: { id: result.insertId, emri: emri.trim(), mbiemri: mbiemri.trim(), email: emailNorm },
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.warn(`[Auth] Register: duplicate email ${emailNorm}`);
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    console.error('[Auth] Register error:', err.message);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const emailNorm = (email || '').toLowerCase().trim();
  console.log(`[Auth] Login attempt: ${emailNorm}`);

  try {
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const [rows] = await db.query('SELECT * FROM Klientet WHERE email = ?', [emailNorm]);

    if (!rows.length) {
      console.warn(`[Auth] Login: no account found for ${emailNorm}`);
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const user = rows[0];

    const match = await authService.comparePassword(password, user.fjalekalimi_hash);
    if (!match) {
      console.warn(`[Auth] Login: wrong password for ${emailNorm}`);
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const token = authService.signToken({
      id: user.klient_id, email: user.email, emri: user.emri, mbiemri: user.mbiemri,
    });

    console.log(`[Auth] Login: success klient_id=${user.klient_id} email=${user.email}`);

    return res.json({
      token,
      user: { id: user.klient_id, emri: user.emri, mbiemri: user.mbiemri, email: user.email },
    });

  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};
