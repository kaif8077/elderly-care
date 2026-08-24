const { escapeHtml, sendEmail } = require('../services/emailService');

exports.sendSMS = async (req, res) => {
  try {
    const notificationEmail = process.env.SYSTEM_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
    if (!notificationEmail) {
      return res.status(503).json({ message: 'SYSTEM_NOTIFICATION_EMAIL is not configured' });
    }

    const { body, latitude, longitude } = req.body;
    const locationUrl =
      latitude && longitude ? `https://maps.google.com/?q=${latitude},${longitude}` : null;

    await sendEmail({
      to: notificationEmail,
      subject: 'URGENT: ElderlyCare emergency alert',
      text: `${body || 'Emergency assistance requested'}${locationUrl ? `\nLocation: ${locationUrl}` : ''}`,
      html: `
        <h1 style="color:#c0392b">Emergency alert</h1>
        <p>${escapeHtml(body || 'Emergency assistance requested')}</p>
        ${locationUrl ? `<p><a href="${locationUrl}">Open location in Google Maps</a></p>` : '<p>Location was not available.</p>'}
        <p>Please contact emergency services if immediate assistance is required.</p>`
    });

    res.json({ success: true, delivery: 'email' });
  } catch (error) {
    console.error('Emergency email error:', error.message);
    res.status(500).json({ message: 'Failed to send emergency email' });
  }
};
