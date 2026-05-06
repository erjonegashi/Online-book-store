const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const db      = require('../config/db');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLoginNotification,
} = require('../utils/mailer');

const UBT_DOMAIN = '@ubt-uni.net';
const isUBTEmail = email =>
  typeof email === 'string' && email.toLowerCase().endsWith(UBT_DOMAIN);

const mkToken = () => crypto.randomBytes(32).toString('hex');
const JWT_OPTS = { expiresIn: '24h' };
const JWT_SECRET = () => process.env.JWT_SECRET || 'bookstore_secret';

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { emri, mbiemri, email, password, telefoni, adresa, qyteti, kodi_postar } = req.body;

    if (!emri || !mbiemri || !email || !password)
      return res.status(400).json({ error: 'Please fill in all required fields' });

    if (!isUBTEmail(email))
      return res.status(403).json({ error: `Only UBT university emails are allowed (${UBT_DOMAIN})` });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const hash              = await bcrypt.hash(password, 10);
    const verificationToken = mkToken();

    const [result] = await db.query(
      `INSERT INTO Klientet
        (emri,mbiemri,email,fjalekalimi_hash,telefoni,adresa,qyteti,kodi_postar,
         email_verified,verification_token)
       VALUES (?,?,?,?,?,?,?,?,0,?)`,
      [emri, mbiemri, email, hash,
       telefoni || null, adresa || null, qyteti || null, kodi_postar || null,
       verificationToken]
    );

    sendVerificationEmail({ emri, mbiemri, email }, verificationToken)
      .catch(err => console.error('[Auth] register verification email error:', err.message));

    const token = jwt.sign({ id: result.insertId, email, emri, mbiemri }, JWT_SECRET(), JWT_OPTS);
    res.status(201).json({
      token,
      user: { id: result.insertId, emri, mbiemri, email },
      needsVerification: true,
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'An account with this email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// ── Verify email ──────────────────────────────────────────────────────────────
router.get('/verify/:token', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT klient_id FROM Klientet WHERE verification_token = ?',
      [req.params.token]
    );
    if (!rows.length)
      return res.status(400).json({ error: 'This verification link is invalid or has already been used.' });

    await db.query(
      'UPDATE Klientet SET email_verified = 1, verification_token = NULL WHERE klient_id = ?',
      [rows[0].klient_id]
    );
    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Resend verification ───────────────────────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!isUBTEmail(email))
      return res.status(403).json({ error: `Only UBT emails are allowed (${UBT_DOMAIN})` });

    const [rows] = await db.query('SELECT * FROM Klientet WHERE email = ?', [email]);
    if (!rows.length)
      return res.json({ message: 'If this email is registered and unverified, a new email will be sent.' });

    const user = rows[0];
    if (user.email_verified)
      return res.status(400).json({ error: 'This account is already verified. You can log in.' });

    const newToken = mkToken();
    await db.query(
      'UPDATE Klientet SET verification_token = ? WHERE klient_id = ?',
      [newToken, user.klient_id]
    );
    sendVerificationEmail({ emri: user.emri, mbiemri: user.mbiemri, email: user.email }, newToken)
      .catch(err => console.error('[Auth] resend verification email error:', err.message));
    res.json({ message: 'A new verification email has been sent to your inbox.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM Klientet WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Incorrect email or password' });

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.fjalekalimi_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect email or password' });

    if (isUBTEmail(email) && !user.email_verified) {
      return res.status(403).json({
        error: 'Your email address has not been verified yet.',
        needsVerification: true,
        email: user.email,
      });
    }

    const token = jwt.sign(
      { id: user.klient_id, email: user.email, emri: user.emri, mbiemri: user.mbiemri },
      JWT_SECRET(), JWT_OPTS
    );

    if (isUBTEmail(user.email))
      sendLoginNotification({ emri: user.emri, mbiemri: user.mbiemri, email: user.email })
        .catch(err => console.error('[Auth] login notification email error:', err.message));

    res.json({
      token,
      user: { id: user.klient_id, emri: user.emri, mbiemri: user.mbiemri, email: user.email },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Forgot password ───────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!isUBTEmail(email))
      return res.status(403).json({ error: `Only UBT university emails are allowed (${UBT_DOMAIN})` });

    const [rows] = await db.query('SELECT * FROM Klientet WHERE email = ?', [email]);
    if (!rows.length)
      return res.json({ message: 'If this email is registered, a reset link has been sent.' });

    const user       = rows[0];
    const resetToken = mkToken();
    const expires    = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      'UPDATE Klientet SET reset_token = ?, reset_token_expires = ? WHERE klient_id = ?',
      [resetToken, expires, user.klient_id]
    );
    // fire-and-forget — never block the HTTP response for SMTP
    sendPasswordResetEmail({ emri: user.emri, mbiemri: user.mbiemri, email: user.email }, resetToken)
      .catch(err => console.error('[Auth] forgot-password email error:', err.message));
    res.json({ message: 'If this email is registered, a reset link has been sent.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Reset password ────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!password || password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const [rows] = await db.query(
      'SELECT * FROM Klientet WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    if (!rows.length)
      return res.status(400).json({
        error: 'This reset link is invalid or has expired. Please request a new one.',
        expired: true,
      });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'UPDATE Klientet SET fjalekalimi_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE klient_id = ?',
      [hash, rows[0].klient_id]
    );
    res.json({ message: 'Password updated successfully! You can now log in.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
