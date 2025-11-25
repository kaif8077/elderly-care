const MedicalProfile = require('../models/MedicalProfile');
const QRCode = require('qrcode');

// Helper function to generate QR code
const generateQR = async (text) => {
    try {
        return await QRCode.toDataURL(text);
    } catch (err) {
        console.error('QR Code generation error:', err);
        return null;
    }
};

exports.createProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    try {
        // Process height (convert from inches to cm if needed)
        let height = Number(req.body.height);
        if (req.body.heightUnit === 'inches') {
            height = Math.round(height * 2.54); // Convert inches to cm
        }

        // Create profile data
        const profileData = {
            userId: req.user.id,
            ...req.body,
            dob: new Date(req.body.dob),
            height,
            weight: Number(req.body.weight),
            medicalHistory: req.body.medicalHistory || [],
            allergies: req.body.allergies || [],
            medications: req.body.medications || [],
            currentSymptoms: req.body.currentSymptoms || []
        };

        // Generate QR code with essential emergency info
        const qrText = `MEDICAL PROFILE\nName: ${profileData.name}\nDOB: ${profileData.dob.toISOString().split('T')[0]}\nBlood: ${profileData.bloodGroup || 'Unknown'}\nAllergies: ${profileData.allergies.join(', ') || 'None'}\nEmergency: ${profileData.emergencyContact} (${profileData.emergencyPhone})`;
        profileData.qrCodeImage = await generateQR(qrText);

        // Create and save profile
        const profile = new MedicalProfile(profileData);
        await profile.save();
        
        res.status(201).json({
            message: 'Medical profile created successfully',
            profile
        });
    } catch (error) {
        console.error('Error creating medical profile:', error);
        res.status(500).json({ 
            message: 'Error creating medical profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getMedicalProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        // Authorization check
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access to medical profile' });
        }

        const medicalProfile = await MedicalProfile.findOne({ userId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        if (!medicalProfile) {
            return res.status(404).json({ message: 'Medical profile not found' });
        }

        // Format response
        const response = {
            ...medicalProfile,
            dob: medicalProfile.dob.toISOString().split('T')[0] // Format date as YYYY-MM-DD
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching medical profile:', error);
        res.status(500).json({ 
            message: 'Error fetching medical profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.updateProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        // Authorization check
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to update this profile' });
        }

        // Find existing profile
        const existingProfile = await MedicalProfile.findOne({ userId });
        if (!existingProfile) {
            return res.status(404).json({ message: 'Medical profile not found' });
        }

        // Process updates
        const updates = { ...req.body };
        
        // Handle height conversion if needed
        if (updates.height) {
            updates.height = Number(updates.height);
            if (req.body.heightUnit === 'inches') {
                updates.height = Math.round(updates.height * 2.54);
            }
        }

        // Convert weight to number if present
        if (updates.weight) {
            updates.weight = Number(updates.weight);
        }

        // Convert date if present
        if (updates.dob) {
            updates.dob = new Date(updates.dob);
        }

        // Update and save profile
        Object.assign(existingProfile, updates);
        await existingProfile.save();

        res.status(200).json({
            message: 'Medical profile updated successfully',
            profile: existingProfile
        });
    } catch (error) {
        console.error('Error updating medical profile:', error);
        res.status(500).json({ 
            message: 'Error updating medical profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getQRCode = async (req, res) => {
    const { userId } = req.params;

    try {
        // Authorization check
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access to QR code' });
        }

        const profile = await MedicalProfile.findOne({ userId });
        if (!profile || !profile.qrCodeImage) {
            return res.status(404).json({ message: 'QR code not found' });
        }

        res.status(200).json({ qrCodeImage: profile.qrCodeImage });
    } catch (error) {
        console.error('Error fetching QR code:', error);
        res.status(500).json({ 
            message: 'Error fetching QR code',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};