require('dotenv').config();
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

// CORS setup - EK HI BAAR USE KAREIN
app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

// Pre-flight requests handle karein
app.options('*', cors());

// Middleware
app.use(express.json());

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

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Backend is running successfully!',
        timestamp: new Date().toISOString(),
        frontend: 'https://elderly-care-xi.vercel.app'
    });
});

module.exports = app;
