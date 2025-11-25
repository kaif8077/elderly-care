import api from './api';


export const submitFeedbackForm = async (formData) => {
  try {
    const response = await api.post('/feedback', formData); // No /api prefix needed
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to submit feedback');
  }
};