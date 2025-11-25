const Contact = require('../models/Contact');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Save to database
    const newContact = await Contact.create({ name, email, message });

    // Send confirmation email
    const emailContent = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'No Reply - ElderlyCare Team'
      },
      subject: 'Thank you for contacting ElderlyCare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Hello ${name},</h2>
          <p>We've received your message and our team will get back to you within 24 hours.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
            <p><strong>Your Message:</strong></p>
            <p>${message}</p>
          </div>
          
          <p>If you didn't initiate this request, please ignore this email.</p>
          <p style="margin-top: 30px;">Best regards,</p>
          <p><strong>The ElderlyCare Team</strong></p>
        </div>
      `
    };

    await sgMail.send(emailContent);

    return res.status(201).json({ 
      success: true,
      message: 'Thank you! Your message has been sent and a confirmation email is on its way.'
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
};