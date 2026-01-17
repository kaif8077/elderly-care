import React, { useState } from 'react';
import { submitContactForm } from '../services/contactService';
import { submitFeedbackForm } from '../services/feedbackService';
import './Contact.css';

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

  // Success states
  const [contactSuccess, setContactSuccess] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Errors
  const [contactError, setContactError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactError('');
    setContactSuccess('');

    try {
      const response = await submitContactForm(contact);
      setContactSuccess(response.message);
      setContact({ name: '', email: '', message: '' });
    } catch (error) {
      setContactError(error.message || 'Failed to send message');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Handle feedback form submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    setFeedbackError('');
    setFeedbackSuccess('');

    try {
      const response = await submitFeedbackForm(feedback);
      setFeedbackSuccess(response.message);
      setFeedback({ name: '', email: '', rating: '', comments: '' });
    } catch (error) {
      setFeedbackError(error.message || 'Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Handle input changes
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContact(prev => ({ ...prev, [name]: value }));
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Send us a message or share your feedback!</p>
        </div>

        <div className="forms-wrapper">
          {/* Contact Form */}
          <div className="form-section">
            <h2>Send us a Message</h2>
            <form onSubmit={handleContactSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="contact-name">Your Name *</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  value={contact.name}
                  onChange={handleContactChange}
                  required
                  placeholder="Enter your full name"
                  disabled={isSubmittingContact}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Email Address *</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={contact.email}
                  onChange={handleContactChange}
                  required
                  placeholder="Enter your email address"
                  disabled={isSubmittingContact}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Message *</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={contact.message}
                  onChange={handleContactChange}
                  required
                  rows="5"
                  placeholder="Tell us how we can help you..."
                  disabled={isSubmittingContact}
                />
              </div>

              {contactError && (
                <div className="error-message">
                  <strong>Error:</strong> {contactError}
                </div>
              )}

              {contactSuccess && (
                <div className="success-message">
                  <strong>Success:</strong> {contactSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingContact}
                className="submit-btn"
              >
                {isSubmittingContact ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Feedback Form */}
          <div className="form-section">
            <h2>Share Your Feedback</h2>
            <form onSubmit={handleFeedbackSubmit} className="feedback-form">
              <div className="form-group">
                <label htmlFor="feedback-name">Your Name *</label>
                <input
                  type="text"
                  id="feedback-name"
                  name="name"
                  value={feedback.name}
                  onChange={handleFeedbackChange}
                  required
                  placeholder="Enter your full name"
                  disabled={isSubmittingFeedback}
                />
              </div>

              <div className="form-group">
                <label htmlFor="feedback-email">Email Address *</label>
                <input
                  type="email"
                  id="feedback-email"
                  name="email"
                  value={feedback.email}
                  onChange={handleFeedbackChange}
                  required
                  placeholder="Enter your email address"
                  disabled={isSubmittingFeedback}
                />
              </div>

              <div className="form-group">
                <label htmlFor="feedback-rating">Your Rating *</label>
                <select
                  id="feedback-rating"
                  name="rating"
                  value={feedback.rating}
                  onChange={handleFeedbackChange}
                  required
                  disabled={isSubmittingFeedback}
                >
                  <option value="">Select your rating</option>
                  <option value="5">⭐️⭐️⭐️⭐️⭐️ Excellent</option>
                  <option value="4">⭐️⭐️⭐️⭐️ Very Good</option>
                  <option value="3">⭐️⭐️⭐️ Good</option>
                  <option value="2">⭐️⭐️ Fair</option>
                  <option value="1">⭐️ Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="feedback-comments">Comments *</label>
                <textarea
                  id="feedback-comments"
                  name="comments"
                  value={feedback.comments}
                  onChange={handleFeedbackChange}
                  required
                  rows="5"
                  placeholder="Share your experience and suggestions..."
                  disabled={isSubmittingFeedback}
                />
              </div>

              {feedbackError && (
                <div className="error-message">
                  <strong>Error:</strong> {feedbackError}
                </div>
              )}

              {feedbackSuccess && (
                <div className="success-message">
                  <strong>Success:</strong> {feedbackSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingFeedback}
                className="submit-btn"
              >
                {isSubmittingFeedback ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Additional Contact Info */}
        <div className="contact-info">
          <div className="info-card">
            <h3>📧 Email</h3>
            <p>support@elderlycare.com</p>
          </div>
          <div className="info-card">
            <h3>📞 Phone</h3>
            <p>+1 (555) 123-4567</p>
          </div>
          <div className="info-card">
            <h3>🕒 Response Time</h3>
            <p>Within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
