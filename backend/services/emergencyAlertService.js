const crypto = require('crypto');
const { sendEmail } = require('./emailService');

const hashIp = (ip) => crypto.createHmac('sha256', process.env.ALERT_HASH_SECRET || process.env.JWT_SECRET)
  .update(String(ip || 'unknown')).digest('hex');

const duplicateKey = ({ qrId, ipHash }) =>
  crypto.createHash('sha256').update(`${qrId}:${ipHash}`).digest('hex');

const sendGenericActivationEmail = ({ to, elderlyCareId, activatedAt }) => sendEmail({
  to,
  subject: 'ElderlyCare emergency QR activated',
  text: `The emergency QR for ${elderlyCareId} was activated at ${activatedAt.toISOString()}. No responder identity, location, or medical information was included in this email.`,
  html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:24px">
    <h1 style="color:#a32118">Emergency QR activated</h1>
    <p>The emergency QR for <strong>${elderlyCareId}</strong> was activated at ${activatedAt.toISOString()}.</p>
    <p>No responder identity, precise location, or medical information was transmitted in this email.</p>
    <p>Please contact the elderly person or their guardian if assistance may be required.</p>
  </div>`
});

module.exports = { duplicateKey, hashIp, sendGenericActivationEmail };
