const Contact = require('../models/Contact');
const { escapeHtml, sendEmail } = require('../services/emailService');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const notificationEmail = process.env.SYSTEM_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    await Contact.create({ name, email, phone, message });

    await Promise.all([
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
    ]);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received.'
    });
  } catch (error) {
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
