const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name is too long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    maxlength: [254, 'Email is too long'],
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
    minlength: [10, 'Message should be at least 10 characters'],
    maxlength: [2000, 'Message should be 2000 characters or fewer']
  },
  duplicateKey: { type: String, select: false },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ContactSchema.index({ duplicateKey: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', ContactSchema);
