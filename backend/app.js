require('dotenv').config({ override: true });
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const medicalReportRoutes = require('./routes/medicalReportRoutes');
const qrRoutes = require('./routes/qrRoutes');
const locationRoutes = require('./routes/locationRoutes');
const smsRoutes = require('./routes/smsRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const emergencyAlertRoutes = require('./routes/emergencyAlertRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminIdCardRoutes = require('./routes/adminIdCardRoutes');
const adminAuditRoutes = require('./routes/adminAuditRoutes');
const adminReportRoutes = require('./routes/adminReportRoutes');
const adminContactRoutes = require('./routes/adminContactRoutes');
const adminFeedbackRoutes = require('./routes/adminFeedbackRoutes');
const cors = require('cors');
const securityHeaders = require('./middleware/securityHeaders');
const { configuredOrigins } = require('./middleware/requireTrustedOrigin');
const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors({
    origin: (origin, done) => {
        if (!origin) return done(null, true);
        const normalized = String(origin).replace(/\/$/, '');
        return configuredOrigins().includes(normalized)
            ? done(null, true)
            : done(new Error('Origin is not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 600
}));
app.disable('x-powered-by');
app.use(securityHeaders);
app.use(express.json());

app.get('/api/health', (req, res) => {
    const databaseReady = mongoose.connection.readyState === 1;
    return res.status(databaseReady ? 200 : 503).json({
        status: databaseReady ? 'healthy' : 'degraded',
        database: databaseReady ? 'connected' : 'unavailable',
        timestamp: new Date().toISOString()
    });
});
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/id-cards', adminIdCardRoutes);
app.use('/api/admin/audit-logs', adminAuditRoutes);
app.use('/api/admin/reports', adminReportRoutes);
app.use('/api/admin/contacts', adminContactRoutes);
app.use('/api/admin/feedback', adminFeedbackRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/medical-reports', medicalReportRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/send-sms', smsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/emergency-alerts', emergencyAlertRoutes);
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// ROOT ROUTE ADD KARO - Yeh missing tha
app.get('/api', (req, res) => {
    res.json({
        message: 'Elderly Care Backend API is running! 🚀',
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            'GET /api/ - API Status (you are here)',
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
