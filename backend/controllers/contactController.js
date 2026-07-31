const Contact = require('../models/Contact');
const { escapeHtml, sendEmail } = require('../services/emailService');
const crypto = require('crypto');
const { hashIp } = require('../services/emergencyAlertService');

exports.submitContact = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = String(req.body.phone || '').trim();
    const message = String(req.body.message || '').trim();
    const notificationEmail = process.env.SYSTEM_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const duplicateKey = crypto.createHash('sha256')
      .update(`${email}:${message}:${hashIp(req.ip)}`).digest('hex');
    const recent = await Contact.findOne({ duplicateKey, createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }).lean();
    if (recent) return res.status(200).json({ success: true, message: 'Thank you! Your message has already been received.' });
    await Contact.create({ name, email, phone, message, duplicateKey });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received.'
    });

    const emailTasks = [
      sendEmail({
        to: email,
        subject: 'Thank you for contacting ElderlyCare',
        replyTo: notificationEmail,
        text: `Hello ${name},\n\nWe received your message and will get back to you soon.\n\nElderlyCare Team`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
            <h2>Hello ${escapeHtml(name)},</h2>
            <p>We received your message and will get back to you soon.</p>
            <blockquote style="background:#f8f9fa;padding:15px;border-left:4px solid #3498db">
              ${escapeHtml(message)}
            </blockquote>
            <p>ElderlyCare Team</p>
          </div>`
      }),
      notificationEmail ? sendEmail({
        to: notificationEmail,
        subject: `New ElderlyCare contact from ${name}`,
        replyTo: email,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`,
        html: `
          <h2>New contact submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message)}</p>`
      }) : Promise.resolve()
    ];

    Promise.allSettled(emailTasks).then((results) => {
      results.forEach((result) => {
        if (result.status === 'rejected') {
          console.error('Contact email delivery error:', result.reason?.message || 'Unknown email error');
        }
      });
    });
  } catch (error) {
    if (res.headersSent) return;
    console.error('Contact submission error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((value) => value.message).join(', ')
      });
    }
    res.status(500).json({ success: false, message: 'Unable to submit contact form' });
  }
};
