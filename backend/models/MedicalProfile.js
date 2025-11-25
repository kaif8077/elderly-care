const mongoose = require('mongoose');

const medicalProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null] },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    dietPreference: { type: String, required: true, enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'] },
    phone: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    emergencyPhone: { type: String, required: true },
    address: { type: String, required: true },
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
    qrCodeImage: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('MedicalProfile', medicalProfileSchema);