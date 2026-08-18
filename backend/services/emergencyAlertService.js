const crypto = require('crypto');
const { escapeHtml, sendEmail } = require('./emailService');

const hashIp = (ip) => crypto.createHmac('sha256', process.env.ALERT_HASH_SECRET || process.env.JWT_SECRET)
  .update(String(ip || 'unknown')).digest('hex');

const duplicateKey = ({ qrId, ipHash }) =>
  crypto.createHash('sha256').update(`${qrId}:${ipHash}`).digest('hex');

const sendGenericActivationEmail = ({ to, elderlyCareId, activatedAt, emergencyType, responderMessage, mapUrl, locationAccuracy, acknowledgementUrl }) => sendEmail({
  to,
  subject: 'ElderlyCare emergency QR activated',
  text: `The emergency QR for ${elderlyCareId} was activated at ${activatedAt.toISOString()}. Type: ${emergencyType || 'medical emergency'}.${responderMessage ? ` Message: ${responderMessage}` : ''}${mapUrl ? ` Current location shared by responder: ${mapUrl}${locationAccuracy ? ` (accuracy approximately ${Math.round(locationAccuracy)} metres)` : ''}` : ' Current location was not shared.'}${acknowledgementUrl ? ` Acknowledge: ${acknowledgementUrl}` : ''}`,
  html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:24px">
    <h1 style="color:#a32118">Emergency QR activated</h1>
    <p>The emergency QR for <strong>${elderlyCareId}</strong> was activated at ${activatedAt.toISOString()}.</p>
    <p><strong>Situation:</strong> ${escapeHtml(emergencyType || 'medical emergency')}</p>
    ${responderMessage ? `<p><strong>Responder message:</strong> ${escapeHtml(responderMessage)}</p>` : ''}
    ${mapUrl ? `<div style="background:#edf3ff;border-left:4px solid #0066ff;padding:12px;margin:16px 0"><strong>Responder's current location</strong><p style="margin:8px 0 0"><a href="${escapeHtml(mapUrl)}">Open location in Google Maps</a>${locationAccuracy ? ` · approximately ${Math.round(locationAccuracy)} metres accuracy` : ''}</p></div>` : '<p><strong>Location:</strong> Not shared by the responder.</p>'}
    ${acknowledgementUrl ? `<p><a href="${escapeHtml(acknowledgementUrl)}">Acknowledge this alert</a></p>` : ''}
    <p>Please contact the elderly person or their guardian if assistance may be required.</p>
  </div>`
});

module.exports = { duplicateKey, hashIp, sendGenericActivationEmail };
