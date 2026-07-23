const { Resend } = require('resend');

let resendClient;

const getClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
};

const getFromAddress = () => {
  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL is not configured');
  }
  return process.env.RESEND_FROM_EMAIL;
};

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const { data, error } = await getClient().emails.send({
    from: getFromAddress(),
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {})
  });

  if (error) {
    throw new Error(error.message || 'Resend failed to send email');
  }

  return data;
};

const sendOtpEmail = ({ to, otp, purpose }) => {
  const labels = {
    registration: 'registration',
    login: 'login',
    password_reset: 'password reset',
    scanner: 'medical profile access'
  };
  const label = labels[purpose] || 'verification';

  return sendEmail({
    to,
    subject: `ElderlyCare ${label} code`,
    text: `Your ElderlyCare ${label} code is ${otp}. It expires in 10 minutes. Do not share this code.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2 style="color:#2c3e50">ElderlyCare verification</h2>
        <p>Use this code to complete your ${escapeHtml(label)}:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f3f6f8;text-align:center">
          ${escapeHtml(otp)}
        </div>
        <p>This code expires in 10 minutes. Do not share it with anyone.</p>
        <p>If you did not request this code, you can ignore this email.</p>
      </div>
    `
  });
};

module.exports = {
  escapeHtml,
  sendEmail,
  sendOtpEmail
};
