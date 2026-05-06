/**
 * mailer.js — BookStore UBT email system
 *
 * DEV MODE (SMTP not configured):
 *   Verification and reset URLs are printed to the terminal so the full
 *   auth flow can be tested without real email credentials.
 *
 * PRODUCTION MODE (SMTP configured in .env):
 *   Emails are delivered via Nodemailer to the recipient's inbox.
 */

'use strict';

const nodemailer = require('nodemailer');

// ─── Credential check ─────────────────────────────────────────────────────────

const PLACEHOLDERS = new Set([
  'your-email@outlook.com',
  'your-password',
  'your_email@outlook.com',
  'your_password',
  'change-me',
  '',
]);

function smtpReady() {
  const u = (process.env.SMTP_USER || '').trim().toLowerCase();
  const p = (process.env.SMTP_PASS || '').trim();
  return u.length > 0 && p.length > 0
    && !PLACEHOLDERS.has(u)
    && !PLACEHOLDERS.has(p);
}

// ─── Transporter factory ──────────────────────────────────────────────────────
// A fresh transport is created per-send so env-var changes take effect without
// a server restart (useful when the user fills in credentials and saves .env).

function createTransport() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,          // true only for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls:               { rejectUnauthorized: false },
    connectionTimeout: 15_000,
    socketTimeout:     20_000,
    greetingTimeout:   15_000,
  });
}

// ─── SMTP startup verification ────────────────────────────────────────────────

async function verifySmtp() {
  if (!smtpReady()) {
    console.log('[Mailer] ⚠  SMTP not configured — running in DEV MODE');
    console.log('[Mailer]    Verification and reset links will be printed here instead.');
    console.log('[Mailer]    To enable real emails: fill SMTP_USER and SMTP_PASS in .env');
    return false;
  }

  try {
    await createTransport().verify();
    console.log(`[Mailer] ✓  SMTP connected  →  ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`[Mailer]    Sending as: ${process.env.SMTP_USER}`);
    return true;
  } catch (err) {
    console.error(`[Mailer] ✗  SMTP connection failed: ${err.message}`);

    if (/535|534|auth|credential/i.test(err.message)) {
      console.error('[Mailer]    FIX: Wrong username or password.');
      console.error('[Mailer]    If MFA is enabled you need an App Password:');
      console.error('[Mailer]      Gmail   → myaccount.google.com/security → App passwords');
      console.error('[Mailer]      Outlook → account.microsoft.com/security → App passwords');
    } else if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(err.message)) {
      console.error('[Mailer]    FIX: Cannot reach SMTP server. Check SMTP_HOST and SMTP_PORT.');
    }

    console.log('[Mailer]    Falling back to DEV MODE (links printed to console).');
    return false;
  }
}

// ─── Core send ────────────────────────────────────────────────────────────────

async function sendMail(to, subject, html) {
  if (!smtpReady()) return false;   // dev-mode callers handle logging themselves

  try {
    const info = await createTransport().sendMail({
      from: `"BookStore UBT" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Mailer] ✓  Sent  → ${to}  (${info.messageId})`);
    return true;
  } catch (err) {
    console.error(`[Mailer] ✗  Failed → ${to}: ${err.message}`);
    return false;
  }
}

// ─── Dev-mode console printer ─────────────────────────────────────────────────

function devLog(label, to, url) {
  const LINE = '═'.repeat(70);
  console.log('\n' + LINE);
  console.log(`  [DEV EMAIL] ${label}`);
  console.log(`  To:  ${to}`);
  console.log(`  URL: ${url}`);
  console.log(`  → Open the URL above in your browser to complete the action.`);
  console.log(LINE + '\n');
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

const YEAR    = new Date().getFullYear();
const CREDITS = 'Viona Lushta, Suela Zeneli &amp; Erjona Gashi';

const HDR = `
  <td style="background:linear-gradient(135deg,#0f2044 0%,#1d4ed8 100%);
             border-radius:20px 20px 0 0;padding:40px 36px;text-align:center;">
    <div style="font-size:44px;line-height:1;margin-bottom:12px;">&#x1F4D6;</div>
    <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">BookStore</h1>
    <p style="color:#93c5fd;margin:5px 0 0;font-size:13px;">UBT University Portal</p>
  </td>`;

const FTR = `
  <td style="background:#0f172a;border-radius:0 0 20px 20px;
             padding:22px 36px;text-align:center;">
    <p style="color:#475569;font-size:12px;margin:0 0 5px;">
      &copy; ${YEAR} BookStore &mdash; UBT University. All rights reserved.
    </p>
    <p style="color:#334155;font-size:11px;margin:0;">Developed by ${CREDITS}</p>
  </td>`;

const wrap = body => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;
             font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#f1f5f9;padding:48px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0"
        style="max-width:580px;width:100%;">
        <tr>${HDR}</tr>
        <tr><td style="background:#fff;padding:40px 36px;">${body}</td></tr>
        <tr>${FTR}</tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (href, label, color = '#1d4ed8') =>
  `<a href="${href}"
    style="display:inline-block;background:${color};color:#fff;
           text-decoration:none;font-size:15px;font-weight:700;
           padding:14px 36px;border-radius:12px;letter-spacing:0.02em;">
    ${label}
  </a>`;

const badge = (icon, text, bg = '#dbeafe', color = '#1e40af') =>
  `<div style="display:inline-block;background:${bg};color:${color};
    font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;
    padding:6px 14px;border-radius:100px;margin-bottom:20px;">
    ${icon}&nbsp;${text}
  </div>`;

const notice = (html, bg = '#eff6ff', border = '#bfdbfe', color = '#1e40af') =>
  `<table width="100%" cellpadding="0" cellspacing="0"
    style="background:${bg};border:1.5px solid ${border};
           border-radius:14px;margin-top:24px;">
    <tr><td style="padding:18px 22px;font-size:13px;
                   color:${color};line-height:1.7;">${html}</td></tr>
  </table>`;

function formatNow() {
  return new Date().toLocaleString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
}

// ─── Email builders ───────────────────────────────────────────────────────────

function buildVerificationEmail(user, url) {
  return wrap(`
    ${badge('&#x1F4E7;', 'Email Verification Required')}
    <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 10px;">
      Confirm your email address
    </h2>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 28px;">
      Hi <strong style="color:#0f172a;">${user.emri} ${user.mbiemri}</strong>,<br/>
      Click the button below to verify your UBT email and activate your account.
    </p>
    <div style="text-align:center;margin:32px 0;">
      ${btn(url, '&#x2713;&nbsp;Verify My Email')}
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0 0 4px;">
      Or paste this link into your browser:
    </p>
    <p style="color:#3b82f6;font-size:11px;text-align:center;
              word-break:break-all;margin:0 0 24px;">${url}</p>
    ${notice('&#x26A0;&#xFE0F;&nbsp;If you did not create a BookStore account, ignore this email.',
             '#fef9c3', '#fde047', '#713f12')}
  `);
}

function buildPasswordResetEmail(user, url) {
  return wrap(`
    ${badge('&#x1F511;', 'Password Reset Request', '#fef3c7', '#92400e')}
    <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 10px;">
      Reset your password
    </h2>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 28px;">
      Hi <strong style="color:#0f172a;">${user.emri} ${user.mbiemri}</strong>,<br/>
      We received a password-reset request for <strong>${user.email}</strong>.
      Click below to set a new password. The link expires in <strong>1 hour</strong>.
    </p>
    <div style="text-align:center;margin:32px 0;">
      ${btn(url, '&#x1F510;&nbsp;Reset My Password', '#dc2626')}
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0 0 4px;">
      Or paste this link into your browser:
    </p>
    <p style="color:#3b82f6;font-size:11px;text-align:center;
              word-break:break-all;margin:0 0 24px;">${url}</p>
    ${notice('&#x26A0;&#xFE0F;&nbsp;<strong>Did not request this?</strong> Contact your UBT IT administrator immediately.',
             '#fef2f2', '#fecaca', '#991b1b')}
  `);
}

function buildLoginEmail(user, loginTime) {
  const rows = [
    ['Account',    `${user.emri} ${user.mbiemri}`],
    ['Email',      user.email],
    ['Login time', loginTime],
    ['Status',     'Successful'],
  ].map(([label, value]) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;width:110px;vertical-align:top;">
        <span style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;">${label}</span>
      </td>
      <td style="padding:10px 0 10px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top;">
        <span style="color:#0f172a;font-size:13px;font-weight:600;">${value}</span>
      </td>
    </tr>`).join('');

  return wrap(`
    ${badge('&#x1F510;', 'Login Notification')}
    <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 10px;">
      New Login Detected
    </h2>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Hello <strong style="color:#0f172a;">${user.emri}</strong> &mdash;
      a successful login was recorded on your BookStore account.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f8fafc;border:1.5px solid #e2e8f0;
             border-radius:14px;padding:6px 20px;margin-bottom:24px;">
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      </td></tr>
    </table>
    ${notice('&#x26A0;&#xFE0F;&nbsp;<strong>Not you?</strong> Change your password immediately and contact UBT IT support.',
             '#fef2f2', '#fecaca', '#991b1b')}
  `);
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function sendVerificationEmail(user, token) {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  const url  = `${base}/verify-email/${token}`;

  if (!smtpReady()) {
    devLog('VERIFICATION EMAIL', user.email, url);
    return;
  }
  await sendMail(user.email, 'Verify your UBT BookStore email', buildVerificationEmail(user, url));
}

async function sendPasswordResetEmail(user, token) {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  const url  = `${base}/reset-password/${token}`;

  if (!smtpReady()) {
    devLog('PASSWORD RESET EMAIL', user.email, url);
    return;
  }
  await sendMail(user.email, 'Reset your BookStore password', buildPasswordResetEmail(user, url));
}

async function sendLoginNotification(user) {
  if (!smtpReady()) {
    console.log(`[Mailer] DEV — Login notification for ${user.email} (SMTP not configured, skipped)`);
    return;
  }
  await sendMail(
    user.email,
    'New Login Detected — BookStore UBT',
    buildLoginEmail(user, formatNow())
  );
}

module.exports = {
  verifySmtp,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLoginNotification,
};
