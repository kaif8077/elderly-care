const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
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
  message: {
    type: String,
    required: [true, 'Message is required'],
    minlength: [10, 'Message should be at least 10 characters']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Contact', ContactSchema);