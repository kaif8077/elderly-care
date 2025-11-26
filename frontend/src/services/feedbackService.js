import api from './api';

export const submitFeedbackForm = async (formData) => {
  try {
    console.log('Sending feedback form to:', '/api/feedback');
    const response = await api.post('/api/feedback', formData);
    return response.data;
  } catch (error) {
    console.error('Feedback service error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to submit feedback');
  }
};
