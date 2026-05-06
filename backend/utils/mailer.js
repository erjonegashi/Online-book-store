const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.office365.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false },
});

const YEAR    = new Date().getFullYear();
const CREDITS = 'Viona Lushta, Suela Zeneli &amp; Erjona Gashi';

const header = `
  <td style="background:linear-gradient(135deg,#0f2044 0%,#1d4ed8 100%);
             border-radius:20px 20px 0 0;padding:40px 36px;text-align:center;">
    <div style="font-size:44px;line-height:1;margin-bottom:12px;">📖</div>
    <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">BookStore</h1>
    <p style="color:#93c5fd;margin:5px 0 0;font-size:13px;">UBT University Portal</p>
  </td>`;

const footer = `
  <td style="background:#0f172a;border-radius:0 0 20px 20px;padding:22px 36px;text-align:center;">
    <p style="color:#475569;font-size:12px;margin:0 0 5px;">
      © ${YEAR} BookStore — UBT University. All rights reserved.
    </p>
    <p style="color:#334155;font-size:11px;margin:0;">Developed by ${CREDITS}</p>
  </td>`;

const wrap = body => `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:48px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
        <tr>${header}</tr>
        <tr><td style="background:#fff;padding:40px 36px;">${body}</td></tr>
        <tr>${footer}</tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const btn = (href, label, color = '#1d4ed8') =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#fff;
    text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;
    border-radius:12px;letter-spacing:0.02em;">${label}</a>`;

const badge = (icon, text, color = '#dbeafe', textColor = '#1e40af') =>
  `<div style="display:inline-block;background:${color};color:${textColor};
    font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;
    padding:6px 14px;border-radius:100px;margin-bottom:20px;">${icon} ${text}</div>`;

const notice = (html, bg = '#eff6ff', border = '#bfdbfe', textColor = '#1e40af') =>
  `<table width="100%" cellpadding="0" cellspacing="0"
    style="background:${bg};border:1.5px solid ${border};border-radius:14px;margin-top:24px;">
    <tr><td style="padding:18px 22px;font-size:13px;color:${textColor};line-height:1.7;">${html}</td></tr>
  </table>`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNow() {
  return new Date().toLocaleString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
}

async function send(to, subject, html) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mailer] SMTP credentials not configured — email skipped');
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: `"BookStore UBT" <${process.env.SMTP_USER}>`,
      to, subject, html,
    });
    console.log(`[Mailer] Sent to ${to} — ${info.messageId}`);
  } catch (err) {
    console.error(`[Mailer] Failed (${to}): ${err.message}`);
  }
}

// ─── Email templates ─────────────────────────────────────────────────────────

function buildVerificationEmail(user, verifyUrl) {
  const body = `
    ${badge('📧', 'Email Verification Required')}
    <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 10px;">
      Confirm your email address
    </h2>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 28px;">
      Hi <strong style="color:#0f172a;">${user.emri} ${user.mbiemri}</strong>,<br/>
      You're almost there! Click the button below to verify your UBT email address
      and activate your BookStore account.
    </p>
    <div style="text-align:center;margin:32px 0;">
      ${btn(verifyUrl, '✓ Verify My Email')}
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0 0 4px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color:#3b82f6;font-size:11px;text-align:center;word-break:break-all;margin:0 0 24px;">
      ${verifyUrl}
    </p>
    ${notice('<strong>⏳ This link does not expire.</strong> You can verify your email at any time.')}
    ${notice('If you did not create a BookStore account, you can safely ignore this email.', '#fef9c3', '#fde047', '#713f12')}`;
  return wrap(body);
}

function buildPasswordResetEmail(user, resetUrl) {
  const body = `
    ${badge('🔑', 'Password Reset Request', '#fef3c7', '#92400e')}
    <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 10px;">
      Reset your password
    </h2>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 28px;">
      Hi <strong style="color:#0f172a;">${user.emri} ${user.mbiemri}</strong>,<br/>
      We received a request to reset the password for your BookStore account
      (<strong>${user.email}</strong>). Click the button below to set a new password.
    </p>
    <div style="text-align:center;margin:32px 0;">
      ${btn(resetUrl, '🔐 Reset My Password', '#dc2626')}
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0 0 4px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color:#3b82f6;font-size:11px;text-align:center;word-break:break-all;margin:0 0 24px;">
      ${resetUrl}
    </p>
    ${notice('<strong>⏰ This link expires in 1 hour.</strong> After that, you will need to request a new reset link.')}
    ${notice('<strong>⚠️ Did not request this?</strong> If you did not request a password reset, your account may be at risk. Contact your UBT IT administrator immediately.', '#fef2f2', '#fecaca', '#991b1b')}`;
  return wrap(body);
}

function buildLoginNotificationEmail(user, loginTime) {
  const rows = [
    ['👤 Account',    `${user.emri} ${user.mbiemri}`],
    ['📧 Email',      user.email],
    ['🕐 Login Time', loginTime],
    ['✅ Status',     'Successful Login'],
  ];
  const rowsHTML = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;width:130px;vertical-align:top;">
        <span style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;">${label}</span>
      </td>
      <td style="padding:10px 0 10px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top;">
        <span style="color:#0f172a;font-size:13px;font-weight:600;">${value}</span>
      </td>
    </tr>`).join('');

  const body = `
    ${badge('🔐', 'Login Notification')}
    <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 10px;">
      New Login Detected
    </h2>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 28px;">
      Hello <strong style="color:#0f172a;">${user.emri} ${user.mbiemri}</strong> —
      a successful login was recorded on your UBT BookStore account.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;
             padding:6px 20px;margin-bottom:24px;">
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0">${rowsHTML}</table>
      </td></tr>
    </table>
    ${notice('<strong>⚠️ Not you?</strong> If you did not log in, your account may be compromised. Contact your UBT IT administrator immediately and change your password.', '#fef2f2', '#fecaca', '#991b1b')}`;
  return wrap(body);
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function sendVerificationEmail(user, token) {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  const url  = `${base}/verify-email/${token}`;
  await send(user.email, '📧 Verify your UBT BookStore account', buildVerificationEmail(user, url));
}

async function sendPasswordResetEmail(user, token) {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  const url  = `${base}/reset-password/${token}`;
  await send(user.email, '🔑 Reset your BookStore password', buildPasswordResetEmail(user, url));
}

async function sendLoginNotification(user) {
  await send(
    user.email,
    '🔐 New Login Detected — BookStore UBT',
    buildLoginNotificationEmail(user, formatNow())
  );
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendLoginNotification };
