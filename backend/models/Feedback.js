const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  rating: { 
    type: Number, 
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comments: {
    type: String,
    required: [true, 'Comments are required'],
    minlength: [10, 'Comments should be at least 10 characters']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);