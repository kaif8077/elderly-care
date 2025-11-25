require('dotenv').config();
// console.log(process.env.NGROK_URL);
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const qrRoutes = require('./routes/qrRoutes');
const locationRoutes = require('./routes/locationRoutes');
const smsRoutes = require('./routes/smsRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const cors = require('cors');
const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/location', locationRoutes);
app.use('/profiles', express.static(path.join(__dirname, 'public/profiles')));
app.use('/api/send-sms', smsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// console.log(path.join(__dirname, 'public/profiles'));


module.exports = app;