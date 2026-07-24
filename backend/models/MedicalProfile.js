const mongoose = require('mongoose');

const medicalProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    elderlyCareId: { type: String, unique: true, sparse: true, index: true },
    profileStatus: { type: String, enum: ['draft', 'completed'], default: 'draft' },
    firstName: { type: String, trim: true, maxlength: 60 },
    lastName: { type: String, trim: true, maxlength: 60 },
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    dietPreference: { type: String, required: true, enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'] },
    preferredLanguage: { type: [String], default: [] },
    otherLanguage: { type: String, trim: true, maxlength: 50 },
    maritalStatus: { type: String, enum: ['single', 'married', 'widowed', 'divorced', 'separated', ''] },
    mobilityStatus: { type: String, enum: ['independent', 'walking_aid', 'wheelchair', 'bed_assistance', ''] },
    fallRisk: { type: Boolean, default: false },
    doctorName: { type: String, trim: true, maxlength: 100 },
    doctorPhone: { type: String, trim: true, maxlength: 30 },
    preferredHospital: { type: String, trim: true, maxlength: 150 },
    phone: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    emergencyPhone: { type: String, default: '' },
    emergencyRelationship: { type: String, default: '' },
    emergencyContacts: [{
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        relationship: { type: String, trim: true }
    }],
    address: { type: String, default: '' },
    medicalHistory: { type: [String], default: [] },
    medicalHistoryOther: { type: String },
    allergies: { type: [String], default: [] },
    allergiesOther: { type: String },
    medications: { type: [String], default: [] },
    medicationsOther: { type: String },
    currentSymptoms: { type: [String], default: [] },
    currentSymptomsOther: { type: String },
    hasInsurance: { type: Boolean, default: false },
    insuranceProvider: { type: String },
    insuranceProviderOther: { type: String },
    policyNumber: { type: String },
    profilePhoto: {
        fileId: { type: mongoose.Schema.Types.ObjectId, default: null },
        contentType: { type: String, enum: ['image/jpeg', 'image/png', 'image/webp'] },
        bytes: { type: Number, min: 1, max: 3145728 },
        uploadedAt: { type: Date }
    },
    qrCodeImage: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('MedicalProfile', medicalProfileSchema);
