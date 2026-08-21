import api from './api';

// Sends a validated contact request through the shared API client.
export const submitContactForm = async (formData) => {
  try {
    const response = await api.post('/api/contact', formData);
    return response.data;
  } catch (error) {
    console.error('Contact service error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to send message');
  }
};
