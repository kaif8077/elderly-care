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

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Static files
app.use('/profiles', express.static(path.join(__dirname, 'public/profiles')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/send-sms', smsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// ROOT ROUTE ADD KARO - Yeh missing tha
app.get('/api', (req, res) => {
    res.json({
        message: 'Elderly Care Backend API is running! 🚀',
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            'GET /api/ - API Status (you are here)',
            'GET /api/qr/test-all-users - Test all users',
            'GET /api/qr/profile/:userId - View medical profile',
            'POST /api/qr/ - Create QR code',
            'POST /api/auth/register - User registration',
            'POST /api/auth/login - User login',
            'GET /api/medical/:userId - Get medical profile',
            'POST /api/medical/ - Create medical profile'
        ]
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Elderly Care Backend!',
        description: 'A comprehensive medical profile and QR code system',
        apiBase: '/api',
        frontend: process.env.FRONTEND_URL || 'http://localhost:3000'
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        requestedUrl: req.originalUrl,
        availableRoutes: [
            '/',
            '/api',
            '/api/qr',
            '/api/auth',
            '/api/medical'
        ]
    });
});

module.exports = app;