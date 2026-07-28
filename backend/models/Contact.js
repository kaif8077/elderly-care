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
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[+0-9()\-\s]{8,20}$/, 'Please use a valid phone number']
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
