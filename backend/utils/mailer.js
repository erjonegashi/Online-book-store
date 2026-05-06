'use strict';

/**
 * mailer.js — BookStore UBT email system
 *
 * Two modes:
 *  DEV  — SMTP not configured → URLs printed to terminal, treated as success
 *  PROD — SMTP configured     → real email sent; throws if delivery fails
 */

const nodemailer = require('nodemailer');

// ─── Credential check ─────────────────────────────────────────────────────────

const PLACEHOLDER_PATTERNS = [
  'your-email@',
  'your_email@',
  'your-app-password',
  'your_app_password',
  'your-password',
  'your_password',
  'change-me',
];

function smtpConfigured() {
  const u = (process.env.SMTP_USER || '').trim().toLowerCase();
  const p = (process.env.SMTP_PASS || '').trim();
  if (!u || !p) return false;
  if (PLACEHOLDER_PATTERNS.some(pat => u.includes(pat) || p.includes(pat))) return false;
  return true;
}

// ─── Transporter factory ──────────────────────────────────────────────────────

function createTransport() {
  const port = Number(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host:              process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure:            port === 465,
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
  if (!smtpConfigured()) {
    console.log('[Mailer] ⚠  SMTP not configured — DEV MODE active');
    console.log('[Mailer]    Links will be printed to this terminal instead of emailed.');
    console.log('[Mailer]    Fill SMTP_USER + SMTP_PASS in .env to send real emails.');
    return false;
  }

  try {
    await createTransport().verify();
    console.log(`[Mailer] ✓  SMTP OK — ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`[Mailer]    Sending as: ${process.env.SMTP_USER}`);
    return true;
  } catch (err) {
    console.error(`[Mailer] ✗  SMTP FAILED: ${err.message}`);
    if (/535|534|auth|credential|BadCredentials/i.test(err.message)) {
      console.error('[Mailer]    → Wrong email or password.');
      console.error('[Mailer]      Gmail:   myaccount.google.com/apppasswords');
      console.error('[Mailer]      Outlook: account.microsoft.com/security → App passwords');
    } else if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(err.message)) {
      console.error('[Mailer]    → Cannot reach SMTP server. Check SMTP_HOST / SMTP_PORT.');
    }
    console.error('[Mailer]    Emails will NOT be delivered. Fix credentials and restart.');
    return false;
  }
}

// ─── Core send — THROWS on failure ───────────────────────────────────────────
// Callers must try/catch this. In DEV MODE it resolves silently (no throw).

async function send(to, subject, html) {
  if (!smtpConfigured()) {
    // DEV MODE: email not sent — callers print the link separately
    return;
  }

  console.log(`[Mailer] Sending "${subject}" → ${to} …`);

  let info;
  try {
    info = await createTransport().sendMail({
      from: `"BookStore UBT" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`[Mailer] ✗  SMTP error sending to ${to}: ${err.message}`);
    throw new Error(`Email delivery failed: ${err.message}`);
  }

  console.log(`[Mailer] ✓  Delivered to ${to}  [${info.messageId}]`);
}

// ─── Dev-mode console printer ─────────────────────────────────────────────────

function devPrint(label, to, url) {
  const L = '═'.repeat(70);
  console.log('\n' + L);
  console.log(`  [DEV EMAIL] ${label}`);
  console.log(`  To:  ${to}`);
  console.log(`  URL: ${url}`);
  console.log('  → Open this URL in your browser to complete the action.');
  console.log(L + '\n');
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
      &copy; ${YEAR} BookStore &mdash; UBT University.
    </p>
    <p style="color:#334155;font-size:11px;margin:0;">Developed by ${CREDITS}</p>
  </td>`;

const wrap = body => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
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
</body></html>`;

const btn = (href, label, color = '#1d4ed8') =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#fff;
    text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;
    border-radius:12px;letter-spacing:0.02em;">${label}</a>`;

const badge = (icon, text, bg = '#dbeafe', color = '#1e40af') =>
  `<div style="display:inline-block;background:${bg};color:${color};font-size:12px;
    font-weight:700;text-transform:uppercase;letter-spacing:0.06em;
    padding:6px 14px;border-radius:100px;margin-bottom:20px;">
    ${icon}&nbsp;${text}</div>`;

const notice = (html, bg = '#eff6ff', border = '#bfdbfe', color = '#1e40af') =>
  `<table width="100%" cellpadding="0" cellspacing="0"
    style="background:${bg};border:1.5px solid ${border};border-radius:14px;margin-top:24px;">
    <tr><td style="padding:18px 22px;font-size:13px;color:${color};line-height:1.7;">${html}</td></tr>
  </table>`;

function formatNow() {
  return new Date().toLocaleString('en-GB', {
    weekday:'long', year:'numeric', month:'long', day:'numeric',
    hour:'2-digit', minute:'2-digit', timeZoneName:'short',
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
             '#fef9c3','#fde047','#713f12')}
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
      This link expires in <strong>1 hour</strong>.
    </p>
    <div style="text-align:center;margin:32px 0;">
      ${btn(url, '&#x1F510;&nbsp;Reset My Password', '#dc2626')}
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0 0 4px;">
      Or paste this link into your browser:
    </p>
    <p style="color:#3b82f6;font-size:11px;text-align:center;
              word-break:break-all;margin:0 0 24px;">${url}</p>
    ${notice('&#x26A0;&#xFE0F;&nbsp;<strong>Did not request this?</strong> Contact UBT IT support immediately.',
             '#fef2f2','#fecaca','#991b1b')}
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
      style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;
             padding:6px 20px;margin-bottom:24px;">
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      </td></tr>
    </table>
    ${notice('&#x26A0;&#xFE0F;&nbsp;<strong>Not you?</strong> Change your password immediately and contact UBT IT support.',
             '#fef2f2','#fecaca','#991b1b')}
  `);
}

// ─── Public API ───────────────────────────────────────────────────────────────
// Each function THROWS if real SMTP is configured but delivery fails.
// In DEV MODE (no SMTP), they log the URL and resolve successfully.

async function sendVerificationEmail(user, token) {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;

  if (!smtpConfigured()) {
    devPrint('VERIFICATION EMAIL', user.email, url);
    return { delivered: false, devMode: true };
  }

  await send(user.email, 'Verify your UBT BookStore email', buildVerificationEmail(user, url));
  return { delivered: true, devMode: false };
}

async function sendPasswordResetEmail(user, token) {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

  if (!smtpConfigured()) {
    devPrint('PASSWORD RESET EMAIL', user.email, url);
    return { delivered: false, devMode: true };
  }

  await send(user.email, 'Reset your BookStore password', buildPasswordResetEmail(user, url));
  return { delivered: true, devMode: false };
}

async function sendLoginNotification(user) {
  if (!smtpConfigured()) {
    console.log(`[Mailer] DEV — login notification skipped for ${user.email}`);
    return;
  }
  // Login notification is fire-and-forget — failure must not affect login response.
  // Caller handles the .catch().
  await send(user.email, 'New Login — BookStore UBT', buildLoginEmail(user, formatNow()));
}

module.exports = {
  verifySmtp,
  smtpConfigured,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLoginNotification,
};
