import React, { useState } from 'react';
import { submitContactForm } from '../services/contactService';
import { submitFeedbackForm } from '../services/feedbackService';

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
  
  // Errors
  const [contactError, setContactError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactError('');
    
    try {
      const response = await submitContactForm(contact);
      alert(response.message);
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

  // Handle input changes (both forms)
  const handleChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'contact') {
      setContact(prev => ({ ...prev, [name]: value }));
    } else {
      setFeedback(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="contact-page">
      {/* ... other components ... */}
      
      {/* Contact Form */}
      <form onSubmit={handleContactSubmit}>
        {/* Form fields */}
        <input
          type="text"
          name="name"
          value={contact.name}
          onChange={(e) => handleChange(e, 'contact')}
          required
        />
        {/* Other fields */}
        {contactError && <div className="error-message">{contactError}</div>}
        <button type="submit" disabled={isSubmittingContact}>
          {isSubmittingContact ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {/* Feedback Form */}
      <form onSubmit={handleFeedbackSubmit}>
        {/* Form fields */}
        <input
          type="text"
          name="name"
          value={feedback.name}
          onChange={(e) => handleChange(e, 'feedback')}
          required
        />
        {/* Other fields */}
        {feedbackError && <div className="error-message">{feedbackError}</div>}
        <button type="submit" disabled={isSubmittingFeedback}>
          {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default Contact;