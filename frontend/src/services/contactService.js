import api from './api';


export const submitContactForm = async (formData) => {
  try {
    const response = await api.post('/contact', formData); // No /api prefix needed
    return response.data;
  } catch (error) {
    // Error handling
    throw new Error(error.response?.data?.message || error.message || 'Failed to send message');
  }
};