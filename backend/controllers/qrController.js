require('dotenv').config();
const QRCode = require('../models/QRCode');
const { generateQR, formatMedicalProfile } = require('../utils/generateQR');
const MedicalProfile = require('../models/MedicalProfile');
const twilio = require('twilio');
const Otp = require('../models/Otp');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

// PROFILE PAGE SERVING - MAIN FUNCTION
exports.serveProfilePage = async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log('🎯 Serving profile for user:', userId);
        
        const medicalProfile = await MedicalProfile.findOne({ userId })
            .sort({ createdAt: -1 })
            .exec();

        if (!medicalProfile) {
            console.log('❌ Profile not found for:', userId);
            return res.status(404).send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: #e74c3c;">Profile Not Found</h1>
                        <p>Medical profile for user <strong>${userId}</strong> not found.</p>
                        <p>Please check the user ID or create a new medical profile.</p>
                        <a href="/" style="color: #0066ff;">Go Back</a>
                    </body>
                </html>
            `);
        }

        console.log('✅ Profile found, generating HTML...');
        const htmlContent = await formatMedicalProfile(medicalProfile);
        
        res.set('Content-Type', 'text/html');
        res.send(htmlContent);
        
    } catch (error) {
        console.error('❌ Error serving profile page:', error);
        res.status(500).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #e74c3c;">Server Error</h1>
                    <p>Failed to load profile: ${error.message}</p>
                    <a href="/" style="color: #0066ff;">Go Back</a>
                </body>
            </html>
        `);
    }
};

// QR CODE CREATION - UPDATED
exports.createQRCode = async (req, res) => {
    const { userId } = req.body;

    try {
        console.log('🔍 Looking for medical profile for user:', userId);
        
        const medicalProfile = await MedicalProfile.findOne({ userId })
            .sort({ createdAt: -1 })
            .exec();

        if (!medicalProfile) {
            console.log('❌ Medical profile not found for user:', userId);
            return res.status(404).json({ 
                success: false,
                message: 'Medical profile not found. Please create a medical profile first.' 
            });
        }

        // PERMANENT URL - No more ngrok!
        const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL || "https://elderly-care-backend-2hyt.onrender.com";
        
        // Profile URL that works everywhere
        const profileUrl = `${RENDER_BACKEND_URL}/api/qr/profile/${userId}`;
        
        console.log('📱 Generating QR code for URL:', profileUrl);
        
        const qrCodeImage = await generateQR(profileUrl);
        
        // Update medical profile with QR code
        medicalProfile.qrCodeImage = qrCodeImage;
        medicalProfile.profileUrl = profileUrl;
        await medicalProfile.save();

        // Create QR code record
        const newQRCode = new QRCode({
            data: qrCodeImage,
            userId,
            profileUrl: profileUrl
        });
        await newQRCode.save();

        console.log('✅ QR code created successfully for user:', userId);
        
        res.status(201).json({ 
            success: true,
            qrCode: newQRCode, 
            profileUrl: profileUrl,
            qrCodeImage,
            message: 'QR code generated successfully!'
        });

    } catch (error) {
        console.error('❌ Error creating QR code:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error creating QR code',
            error: error.message 
        });
    }
};

// GET QR CODE
exports.getQRCode = async (req, res) => {
    const { userId } = req.params;

    try {
        const qrCode = await QRCode.findOne({ userId })
            .sort({ createdAt: -1 })
            .exec();

        if (!qrCode) {
            return res.status(404).json({ 
                success: false,
                message: 'QR code not found' 
            });
        }

        res.status(200).json({ 
            success: true,
            qrCode 
        });

    } catch (error) {
        console.error('Error fetching QR code:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching QR code',
            error: error.message 
        });
    }
};

// TEST ROUTE - ALL USERS
exports.testAllUsers = async (req, res) => {
    try {
        const allProfiles = await MedicalProfile.find().select('userId name createdAt').exec();
        
        let html = `
            <html>
                <head>
                    <title>Available Medical Profiles</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        ul { list-style-type: none; padding: 0; }
                        li { padding: 10px; border-bottom: 1px solid #eee; }
                        .user-id { font-weight: bold; color: #0066ff; }
                    </style>
                </head>
                <body>
                    <h1>Available Medical Profiles</h1>
                    <p>Total profiles: ${allProfiles.length}</p>
                    <ul>
        `;
        
        allProfiles.forEach(profile => {
            html += `
                <li>
                    <span class="user-id">${profile.userId}</span> 
                    - ${profile.name || 'No Name'} 
                    - <a href="/api/qr/profile/${profile.userId}" target="_blank">View Profile</a>
                    - <a href="/api/qr/check-user/${profile.userId}" target="_blank">Check Data</a>
                </li>
            `;
        });
        
        html += `
                    </ul>
                    <br>
                    <a href="/">Go Back</a>
                </body>
            </html>
        `;
        
        res.send(html);
    } catch (error) {
        res.status(500).send('Error fetching profiles: ' + error.message);
    }
};

// TEST ROUTE - SPECIFIC USER CHECK
exports.testSpecificUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await MedicalProfile.findOne({ userId }).exec();
        
        res.json({
            success: true,
            userId: userId,
            profileExists: !!profile,
            profile: profile ? {
                name: profile.name,
                phone: profile.phone,
                createdAt: profile.createdAt
            } : null
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// OTP FUNCTIONS (SAME AS BEFORE)
exports.sendScannerOtp = async (req, res) => {
    try {
        console.log('Received OTP request for:', req.body.phone);
        
        const phoneNumber = req.body.phone.replace(/\D/g, '');
        const formattedPhone = `+91${phoneNumber}`;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15*60000);

        console.log('Generated OTP:', {otp, expiresAt, forPhone: formattedPhone});

        const otpRecord = await Otp.create({
            phone: formattedPhone,
            otp,
            expiresAt
        });

        console.log('OTP saved to DB with ID:', otpRecord._id);

        await twilioClient.messages.create({
            body: `Your OTP is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });

        console.log(`OTP for ${formattedPhone}: ${otp}`);
        res.json({ 
            success: true, 
            message: 'OTP sent successfully',
            debugOtp: otp
        });

    } catch (error) {
        console.error('Full error details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send OTP',
            debug: error.message 
        });
    }
};

exports.verifyScannerOtp = async (req, res) => {
    try {
        console.log('Verification attempt:', req.body);
        
        const phone = req.body.phone.replace(/\D/g, '');
        const formattedPhone = `+91${phone}`;
        const otp = req.body.otp;

        const otpRecord = await Otp.findOne({
            phone: formattedPhone
        }).sort({ createdAt: -1 });

        console.log('Found OTP record:', otpRecord);

        if (!otpRecord) {
            return res.status(400).json({ 
                success: false, 
                message: 'No OTP found for this number' 
            });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid OTP' 
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ 
                success: false, 
                message: 'OTP has expired' 
            });
        }

        await Otp.deleteOne({ _id: otpRecord._id });
        
        console.log('Successful verification for:', formattedPhone);
        res.json({ 
            success: true, 
            message: 'OTP verified successfully'
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error during verification',
            debug: error.message 
        });
    }
};
