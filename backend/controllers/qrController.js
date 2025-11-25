require('dotenv').config();
const QRCode = require('../models/QRCode');
const { generateQR, formatMedicalProfile, saveProfileHTML } = require('../utils/generateQR');
const MedicalProfile = require('../models/MedicalProfile');
const twilio = require('twilio');
const Otp = require('../models/Otp'); // New OTP model


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

exports.createQRCode = async (req, res) => {
    const { userId } = req.body;

    try {
        const medicalProfile = await MedicalProfile.findOne({ userId })
            .sort({ createdAt: -1 })
            .exec();

        if (!medicalProfile) {
            return res.status(404).json({ message: 'Medical profile not found' });
        }

        const htmlContent = await formatMedicalProfile(medicalProfile);
        const htmlFilePath = await saveProfileHTML(htmlContent, userId);

        const serverIP = process.env.NGROK_URL;
        const htmlFileUrl = `${serverIP}/profiles/${userId}_profile.html`;

        const qrCodeImage = await generateQR(htmlFileUrl);
        
        medicalProfile.qrCodeImage = qrCodeImage;
        await medicalProfile.save();

        const newQRCode = new QRCode({
            data: qrCodeImage,
            userId,
        });
        await newQRCode.save();

        res.status(201).json({ 
            qrCode: newQRCode, 
            htmlFilePath,
            qrCodeImage 
        });

    } catch (error) {
        console.error('Error creating QR code:', error);
        res.status(500).json({ 
            message: 'Error creating QR code',
            error: error.message 
        });
    }
};

exports.getQRCode = async (req, res) => {
    const { userId } = req.params;

    try {
        const qrCode = await QRCode.findOne({ userId })
            .sort({ createdAt: -1 })
            .exec();

        if (!qrCode) {
            return res.status(404).json({ message: 'QR code not found' });
        }

        res.status(200).json({ qrCode });

    } catch (error) {
        console.error('Error fetching QR code:', error);
        res.status(500).json({ 
            message: 'Error fetching QR code',
            error: error.message 
        });
    }
};


// In your sendOtp function (qrController.js)
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

        // Uncomment for production - comment out the alert
        await twilioClient.messages.create({
            body: `Your OTP is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });

        // For testing - show OTP in console and alert
        console.log(`OTP for ${formattedPhone}: ${otp}`);
        res.json({ 
            success: true, 
            message: 'OTP sent successfully',
            debugOtp: otp // Remove in production
        });

    } catch (error) {
        console.error('Full error details:', {
            error: error.message,
            stack: error.stack,
            requestBody: req.body
        });
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send OTP',
            debug: error.message 
        });
    }
};

// New method for OTP verification
exports.verifyScannerOtp = async (req, res) => {
    try {
        console.log('Verification attempt:', req.body);
        
        const phone = req.body.phone.replace(/\D/g, '');
        const formattedPhone = `+91${phone}`;
        const otp = req.body.otp;

        // 1. Find the most recent OTP
        const otpRecord = await Otp.findOne({
            phone: formattedPhone
        }).sort({ createdAt: -1 });

        console.log('Found OTP record:', otpRecord);

        if (!otpRecord) {
            console.log('No OTP found for phone:', formattedPhone);
            return res.status(400).json({ 
                success: false, 
                message: 'No OTP found for this number' 
            });
        }

        // 2. Check if OTP matches (case insensitive)
        if (otpRecord.otp !== otp) {
            console.log('OTP mismatch:', {
                received: otp,
                expected: otpRecord.otp
            });
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid OTP' 
            });
        }

        // 3. Check expiration
        if (otpRecord.expiresAt < new Date()) {
            console.log('Expired OTP:', {
                expiresAt: otpRecord.expiresAt,
                currentTime: new Date()
            });
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ 
                success: false, 
                message: 'OTP has expired' 
            });
        }

        // 4. Verification successful
        await Otp.deleteOne({ _id: otpRecord._id });
        
        console.log('Successful verification for:', formattedPhone);
        res.json({ 
            success: true, 
            message: 'OTP verified successfully'
        });

    } catch (error) {
        console.error('Verification error:', {
            error: error.message,
            stack: error.stack,
            requestBody: req.body
        });
        res.status(500).json({ 
            success: false, 
            message: 'Error during verification',
            debug: error.message 
        });
    }
};