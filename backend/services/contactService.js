const Contact = require('../models/Contact');
const { escapeHtml, sendEmail } = require('./emailService');

const submitContactForm = async ({ name, email, message }) => {
  await Contact.create({ name, email, message });
  await sendEmail({
    to: email,
    subject: 'Thank you for contacting ElderlyCare',
    replyTo: process.env.ADMIN_EMAIL,
    text: `Hello ${name},\n\nWe received your message and will respond soon.\n\nElderlyCare Team`,
    html: `<h2>Hello ${escapeHtml(name)},</h2><p>We received your message and will respond soon.</p>`
  });

  return { success: true, message: 'Thank you! Your message has been sent successfully.' };
};

module.exports = { submitContactForm };
