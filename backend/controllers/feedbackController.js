const Feedback = require('../models/Feedback');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, rating, comments } = req.body;
    
    // Create new feedback
    const newFeedback = await Feedback.create({
      name,
      email,
      rating: parseInt(rating),
      comments
    });

    // Send confirmation email
    const ratingStars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    const emailContent = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'No Reply - ElderlyCare Team'
      },
      subject: 'Thank you for your feedback',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Hello ${name},</h2>
          <p>Thank you for taking the time to share your feedback with us.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
            <p><strong>Your Rating:</strong> ${ratingStars}</p>
            <p><strong>Your Comments:</strong></p>
            <p>${comments}</p>
          </div>
          
          <p>We value your input and will use it to improve our services.</p>
          <p style="margin-top: 30px;">Best regards,</p>
          <p><strong>The ElderlyCare Team</strong></p>
        </div>
      `
    };

    await sgMail.send(emailContent);

    res.status(201).json({ 
      success: true,
      message: 'Thank you for your feedback! A confirmation email has been sent.'
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};