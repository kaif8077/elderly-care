// services/contactService.js
const sgMail = require('@sendgrid/mail');
const Contact = require('../models/Contact');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const submitContactForm = async (formData) => {
  try {
    // 1. Save to database
    const newContact = new Contact({
      name: formData.name,
      email: formData.email,
      message: formData.message
    });
    await newContact.save();

    // 2. Send confirmation email
    const msg = {
      to: formData.email,
      from: {
        email: 'kaif8528576249@gmail.com', // Use a domain you own
        name: 'ElderlyCare Team'
      },
      subject: 'Thank you for contacting ElderlyCare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">Hello ${formData.name},</h2>
          <p>Thank you for reaching out to ElderlyCare. We've received your message and our team will get back to you soon.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
            <p style="font-style: italic;">"${formData.message}"</p>
          </div>
          
          <p>If you have any urgent questions, please don't hesitate to call our support line at <strong>+1 (800) 555-ELDER</strong>.</p>
          
          <p>Best regards,<br>
          The ElderlyCare Team</p>
          
          <div style="margin-top: 30px; font-size: 12px; color: #7f8c8d;">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      `,
      text: `Hello ${formData.name},\n\nThank you for contacting ElderlyCare. We've received your message:\n\n"${formData.message}"\n\nOur team will respond shortly.\n\nBest regards,\nThe ElderlyCare Team`
    };

    await sgMail.send(msg);

    

    return { success: true, message: 'Thank you! Your message has been sent successfully.' };
  } catch (error) {
    console.error('Error in submitContactForm:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error('Failed to submit contact form. Please try again later.');
  }
};

module.exports = { submitContactForm };