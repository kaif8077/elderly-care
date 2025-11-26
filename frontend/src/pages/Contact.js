import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitContactForm } from '../services/contactService';
import { submitFeedbackForm } from '../services/feedbackService';
import '../pages/Contact.css';
import aboutHero from '../assests/about-hero.jpg';

const Contact = () => {
  // Contact form state
  const [contact, setContact] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Feedback form state
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    rating: '',
    comments: ''
  });

  // Loading states
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Error states
  const [contactError, setContactError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // Handle contact form changes
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContact(prev => ({
      ...prev,
      [name]: value
    }));
    setContactError('');
  };

  // Handle feedback form changes
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: value
    }));
    setFeedbackError('');
  };

  // Validate form function
  const validateForm = (formData, formType) => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      errors.email = 'Valid email required';
    }
    
    if (formType === 'contact') {
      if (!formData.message.trim()) {
        errors.message = 'Message is required';
      } else if (formData.message.trim().length < 10) {
        errors.message = 'Message must be at least 10 characters';
      }
    }
    
    if (formType === 'feedback') {
      if (!formData.rating) {
        errors.rating = 'Please select a rating';
      }
      if (!formData.comments.trim()) {
        errors.comments = 'Comments are required';
      } else if (formData.comments.trim().length < 10) {
        errors.comments = 'Comments must be at least 10 characters';
      }
    }
    
    return errors;
  };

  // Handle contact form submission
  // In your Contact component
const handleContactSubmit = async (e) => {
  e.preventDefault();
  
  const errors = validateForm(contact, 'contact');
  if (Object.keys(errors).length > 0) {
    setContactError(Object.values(errors).join(', '));
    return;
  }
  
  setIsSubmittingContact(true);
  setContactError('');
  
  try {
    const response = await submitContactForm(contact);
    
    // Enhanced success message
    alert(`
      Thank you, ${contact.name}!
      Your message has been sent successfully.
      We've sent a confirmation to ${contact.email}.
    `);
    
    setContact({ name: '', email: '', message: '' });
  } catch (error) {
    setContactError(error.message || 'Failed to send message. Please try again later.');
  } finally {
    setIsSubmittingContact(false);
  }
};

  // Handle feedback form submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(feedback, 'feedback');
    if (Object.keys(errors).length > 0) {
      setFeedbackError(Object.values(errors).join(', '));
      return;
    }
    
    setIsSubmittingFeedback(true);
    setFeedbackError('');
    
    try {
      const response = await submitFeedbackForm(feedback);
      alert(response.message);
      setFeedback({ name: '', email: '', rating: '', comments: '' });
    } catch (error) {
      setFeedbackError(error.message || 'Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Banner */}
      <div 
        className="contact-hero" 
        style={{ backgroundImage: `url(${aboutHero})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="hero-overlay">
          <h1>Contact Us</h1>
          <p>We're here to help you with all your senior care needs</p>
        </div>
      </div>

      {/* Contact Information Section */}
      <section className="section-contact-info">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-method">
              <div className="contact-emoji">📞</div>
              <h3>Phone Support</h3>
              <p>Available during business hours</p>
              <p className="contact-detail">
                <a href="tel:+918528576249">+91 8528576249</a>
              </p>
            </div>

            <div className="contact-method">
              <div className="contact-emoji">✉️</div>
              <h3>Email Us</h3>
              <p>Typically respond within 24 hours</p>
              <p className="contact-detail">
                <a href="mailto:kaif8528576249@gmail.com">kaif8528576249@gmail.com</a>
              </p>
            </div>

            <div className="contact-method">
              <div className="contact-emoji">🏢</div>
              <h3>Visit Us</h3>
              <p>Our headquarters in Moradabad</p>
              <p className="contact-detail">
                <a 
                  href="https://maps.app.goo.gl/mVbpZJ9dhpVq8Xtf9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  MIT College, Moradabad
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form + Feedback Form Section */}
      <section className="section-forms">
        <div className="container">
          <div className="forms-container">
            {/* Contact Form - Left Side */}
            <div className="contact-form-container">
              <h2>Send Us a Message</h2>
              <p className="form-intro">Have questions? Our team will get back to you shortly.</p>
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name*</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    value={contact.name}
                    onChange={handleContactChange}
                    placeholder="Your name" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address*</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={contact.email}
                    onChange={handleContactChange}
                    placeholder="your@email.com" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Your Message* (Minimum 10 characters)</label>
                  <textarea 
                    id="message" 
                    name="message"
                    value={contact.message}
                    onChange={handleContactChange}
                    rows="6" 
                    placeholder="How can we assist you today?" 
                    minLength="10"
                    required
                  ></textarea>
                </div>
                
                {contactError && (
                  <div className="error-message">
                    {contactError.split(', ').map((err, i) => (
                      <div key={i}>{err}</div>
                    ))}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmittingContact}
                >
                  {isSubmittingContact ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Feedback Form - Right Side */}
            <div className="feedback-form-container">
              <h2>Share Your Feedback</h2>
              <p className="form-intro">We value your experience with us</p>
              <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                <div className="form-group">
                  <label htmlFor="feedback-name">Your Name*</label>
                  <input 
                    type="text" 
                    id="feedback-name" 
                    name="name"
                    value={feedback.name}
                    onChange={handleFeedbackChange}
                    placeholder="Your name" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="feedback-email">Email Address*</label>
                  <input 
                    type="email" 
                    id="feedback-email" 
                    name="email"
                    value={feedback.email}
                    onChange={handleFeedbackChange}
                    placeholder="your@email.com" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="feedback-rating">Your Rating*</label>
                  <select 
                    id="feedback-rating" 
                    name="rating"
                    value={feedback.rating}
                    onChange={handleFeedbackChange}
                    required
                  >
                    <option value="">Select rating</option>
                    <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                    <option value="4">⭐⭐⭐⭐ (Very Good)</option>
                    <option value="3">⭐⭐⭐ (Good)</option>
                    <option value="2">⭐⭐ (Fair)</option>
                    <option value="1">⭐ (Poor)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="feedback-comments">Comments* (Minimum 10 characters)</label>
                  <textarea 
                    id="feedback-comments" 
                    name="comments"
                    value={feedback.comments}
                    onChange={handleFeedbackChange}
                    rows="4" 
                    placeholder="Share your experience..." 
                    minLength="10"
                    required
                  ></textarea>
                </div>
                
                {feedbackError && (
                  <div className="error-message">
                    {feedbackError.split(', ').map((err, i) => (
                      <div key={i}>{err}</div>
                    ))}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmittingFeedback}
                >
                  {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-section">
        <p>&copy; 2025 ElderlyCare. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Contact;
