import api from './api';

export const submitContactForm = async (formData) => {
  try {
    console.log('Sending contact form to:', '/api/contact');
    const response = await api.post('/api/contact', formData);
    return response.data;
  } catch (error) {
    console.error('Contact service error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to send message');
  }
};
