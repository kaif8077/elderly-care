const Feedback = require('../models/Feedback');
const { escapeHtml, sendEmail } = require('../services/emailService');

exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, comments } = req.body;
    const notificationEmail = process.env.SYSTEM_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
    const rating = Number(req.body.rating);
    await Feedback.create({ name, email, rating, comments });

    await Promise.all([
      sendEmail({
        to: email,
        subject: 'Thank you for your ElderlyCare feedback',
        replyTo: notificationEmail,
        text: `Hello ${name},\n\nThank you for your ${rating}/5 rating and feedback.\n\nElderlyCare Team`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
            <h2>Hello ${escapeHtml(name)},</h2>
            <p>Thank you for your ${escapeHtml(rating)}/5 rating and feedback.</p>
            <blockquote style="background:#f8f9fa;padding:15px;border-left:4px solid #3498db">
              ${escapeHtml(comments)}
            </blockquote>
            <p>ElderlyCare Team</p>
          </div>`
      }),
      notificationEmail ? sendEmail({
        to: notificationEmail,
        subject: `New ElderlyCare feedback: ${rating}/5`,
        replyTo: email,
        text: `Name: ${name}\nEmail: ${email}\nRating: ${rating}/5\n\n${comments}`,
        html: `
          <h2>New feedback submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Rating:</strong> ${escapeHtml(rating)}/5</p>
          <p>${escapeHtml(comments)}</p>`
      }) : Promise.resolve()
    ]);

    res.status(201).json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('Feedback submission error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((value) => value.message).join(', ')
      });
    }
    res.status(500).json({ success: false, message: 'Unable to submit feedback' });
  }
};
