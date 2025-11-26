import React, { useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MedicalForm.css';

const MedicalForm = ({ onSubmissionSuccess }) => {
    const [formData, setFormData] = useState({
        // Personal Information
        name: '',
        dob: '',
        gender: '',
        bloodGroup: '',
        height: '',
        heightUnit: 'cm',
        customHeight: '',
        weight: '',
        customWeight: '',
        dietPreference: '',

        // Contact Information
        phone: '+91 ',
        emergencyContact: '',
        emergencyPhone: '+91 ',
        address: '',

        // Medical Information
        medicalHistory: [],
        medicalHistoryOther: '',
        allergies: [],
        allergiesOther: '',
        medications: [],
        medicationsOther: '',
        currentSymptoms: [],
        currentSymptomsOther: '',

        // Insurance Information
        hasInsurance: false,
        insuranceProvider: '',
        insuranceProviderOther: '',
        policyNumber: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const toastId = useRef(null);

    // Options for form fields
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const dietPreferences = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'];

    // Height options (4ft to 7ft in inches)
    const heightOptions = [];
    for (let feet = 4; feet <= 6; feet++) {
        for (let inches = 0; inches < 12; inches++) {
            const totalInches = (feet * 12) + inches;
            heightOptions.push({
                value: totalInches,
                label: `${feet}'${inches}" (${Math.round(totalInches * 2.54)}cm)`
            });
        }
    }

    // Weight options (30kg to 150kg in 5kg increments)
    const weightOptions = [];
    for (let i = 45; i <= 100; i += 5) {
        weightOptions.push(i);
    }

    // Medical options
    const medicalHistoryOptions = [
        'Diabetes', 'Hypertension', 'Asthma', 'Heart Disease',
        'Cancer', 'Stroke', 'Kidney Disease', 'Liver Disease', 'Thyroid Disorders',
        'Cholesterol', 'Obesity', 'Anemia', 'Epilepsy', 'Parkinson\'s Disease', 'None', 'Other'
    ];

    const allergiesOptions = [
        'Dust', 'Pollen', 'Food', 'Medication',
        'Animal Dander', 'Mold', 'Shellfish', 'Nuts', 'Latex',
        'Penicillin', 'Aspirin', 'Milk', 'Eggs', 'Wheat', 'None', 'Other'
    ];

    const medicationsOptions = [
        'Metformin', 'Amlodipine', 'Inhalers', 'Statins',
        'Aspirin', 'Paracetamol', 'Ibuprofen', 'Insulin', 'Losartan',
        'Lisinopril', 'Omeprazole', 'Hydrochlorothiazide', 'Warfarin', 'Gabapentin', 'None', 'Other'
    ];

    const symptomsOptions = [
        'Fever', 'Cough', 'Headache', 'Fatigue',
        'Nausea', 'Dizziness', 'Shortness of Breath', 'Chest Pain', 'Swelling',
        'Joint Pain', 'Sore Throat', 'Rash', 'Vomiting', 'Diarrhea', 'None', 'Other'
    ];

    const insuranceProviders = [
        'Star Health and Allied Insurance',
        'Niva Bupa Health Insurance',
        'HDFC ERGO Health Insurance',
        'ICICI Lombard General Insurance',
        'Care Health Insurance',
        'Reliance General Insurance',
        'Tata AIG General Insurance',
        'Bajaj Allianz General Insurance',
        'Aditya Birla Health Insurance',
        'SBI General Insurance',
        'Other'
    ];

    const showToast = (message, type = 'error') => {
        if (toastId.current && toast.isActive(toastId.current)) {
            toast.update(toastId.current, {
                render: message,
                type,
                isLoading: false,
                autoClose: 100
            });
        } else {
            toastId.current = type === 'error' ? toast.error(message) : toast.success(message);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePhoneChange = (e) => {
        const { name, value } = e.target;
        if ((name === 'phone' || name === 'emergencyPhone') &&
            (value.startsWith('+91') && value.length <= 13 || value === '+91 ')) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCheckboxChange = (field, option) => {
        setFormData(prev => {
            const currentValues = [...prev[field]];

            if (option === 'None') {
                return { ...prev, [field]: ['None'] };
            }

            if (currentValues.includes(option)) {
                const newValues = currentValues.filter(item => item !== option && item !== 'None');
                return { ...prev, [field]: newValues };
            } else {
                const newValues = [...currentValues.filter(item => item !== 'None'), option];
                return { ...prev, [field]: newValues };
            }
        });
    };

    const validateForm = () => {
        const errors = [];
        if (!formData.name.trim()) errors.push('Full name is required');
        if (!formData.dob) errors.push('Date of birth is required');
        if (!formData.gender) errors.push('Gender is required');
        if (!formData.height && !formData.customHeight) errors.push('Height is required');
        if (!formData.weight && !formData.customWeight) errors.push('Weight is required');
        if (!formData.dietPreference) errors.push('Diet preference is required');
        if (!formData.phone || formData.phone.length < 13) errors.push('Valid phone number is required');
        if (!formData.emergencyContact.trim()) errors.push('Emergency contact name is required');
        if (!formData.emergencyPhone || formData.emergencyPhone.length < 13) errors.push('Valid emergency phone is required');
        if (!formData.address.trim()) errors.push('Address is required');
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            validationErrors.forEach(error => showToast(error));
            setIsSubmitting(false);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Authentication required. Please log in.');
            setIsSubmitting(false);
            return;
        }

        // Prepare submission data
        const submissionData = {
            ...formData,
            height: formData.height === 'other' ? formData.customHeight : formData.height,
            heightUnit: 'cm',
            weight: formData.weight === 'other' ? formData.customWeight : formData.weight,
            medicalHistory: formData.medicalHistory.includes('Other') ?
                [...formData.medicalHistory.filter(item => item !== 'Other'), formData.medicalHistoryOther] :
                formData.medicalHistory,
            allergies: formData.allergies.includes('Other') ?
                [...formData.allergies.filter(item => item !== 'Other'), formData.allergiesOther] :
                formData.allergies,
            medications: formData.medications.includes('Other') ?
                [...formData.medications.filter(item => item !== 'Other'), formData.medicationsOther] :
                formData.medications,
            currentSymptoms: formData.currentSymptoms.includes('Other') ?
                [...formData.currentSymptoms.filter(item => item !== 'Other'), formData.currentSymptomsOther] :
                formData.currentSymptoms,
            insuranceProvider: formData.insuranceProvider === 'Other' ?
                formData.insuranceProviderOther : formData.insuranceProvider
        };

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/medical`, submissionData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            showToast('Medical profile saved successfully!', 'success');
            if (onSubmissionSuccess) {
                setTimeout(onSubmissionSuccess, 100);
            }
        } catch (error) {
            console.error('Submission error:', error);
            showToast(error.response?.data?.message || 'Error saving medical profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="medical-form-container">
            <h2>Medical Information Form</h2>
            <form onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <fieldset className="form-section">
                    <legend>Personal Information</legend>

                    <div className="form-group">
                        <label>Full Name*</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Date of Birth*</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender*</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Blood Group</label>
                            <select
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                            >
                                <option value="">Select Blood Group</option>
                                {bloodGroups.map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Diet Preference*</label>
                            <select
                                name="dietPreference"
                                value={formData.dietPreference}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Diet</option>
                                {dietPreferences.map(diet => (
                                    <option key={diet} value={diet}>{diet}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Height*(in cms)  </label>
                            {/* <select 
                                name="height" 
                                value={formData.height} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Select Height</option>
                                {heightOptions.map((height, index) => (
                                    <option key={index} value={height.value}>{height.label}</option>
                                ))}
                                <option value="other">Other</option>
                            </select> */}
                            <input name="height" type="number"
                                value={formData.height}
                                onChange={handleChange}
                                required></input>
                            {formData.height === 'other' && (
                                <input
                                    type="number"
                                    name="customHeight"
                                    value={formData.customHeight}
                                    onChange={handleChange}
                                    placeholder="Enter height in cm"
                                    className="custom-input"
                                    required
                                    min="100"
                                    max="250"
                                />
                            )}
                        </div>

                        <div className="form-group">
                            <label>Weight (kg)*</label>
                            <select
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Weight</option>
                                {weightOptions.map(weight => (
                                    <option key={weight} value={weight}>{weight} kg</option>
                                ))}
                                <option value="other">Other</option>
                            </select>
                            {formData.weight === 'other' && (
                                <input
                                    type="number"
                                    name="customWeight"
                                    value={formData.customWeight}
                                    onChange={handleChange}
                                    placeholder="Enter weight in kg"
                                    className="custom-input"
                                    required
                                    min="20"
                                    max="200"
                                />
                            )}
                        </div>
                    </div>
                </fieldset>

                {/* Contact Information Section */}
                <fieldset className="form-section">
                    <legend>Contact Information</legend>

                    <div className="form-group">
                        <label>Phone Number*</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            required
                            pattern="\+91\d{10}"
                            placeholder="+91XXXXXXXXXX"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Emergency Contact Name*</label>
                            <input
                                type="text"
                                name="emergencyContact"
                                value={formData.emergencyContact}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Emergency Phone*</label>
                            <input
                                type="tel"
                                name="emergencyPhone"
                                value={formData.emergencyPhone}
                                onChange={handlePhoneChange}
                                required
                                pattern="\+91\d{10}"
                                placeholder="+91XXXXXXXXXX"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Address*</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            required
                        />
                    </div>
                </fieldset>

                {/* Medical Information Section */}
                <fieldset className="form-section">
                    <legend>Medical Information</legend>

                    <div className="form-group">
                        <label>Medical History</label>
                        <div className="checkbox-grid">
                            {medicalHistoryOptions.map((option, index) => (
                                <div key={index} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        id={`medicalHistory-${index}`}
                                        checked={formData.medicalHistory.includes(option)}
                                        onChange={() => handleCheckboxChange('medicalHistory', option)}
                                    />
                                    <label htmlFor={`medicalHistory-${index}`}>{option}</label>
                                </div>
                            ))}
                        </div>
                        {formData.medicalHistory.includes('Other') && (
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="medicalHistoryOther"
                                    value={formData.medicalHistoryOther}
                                    onChange={handleChange}
                                    placeholder="Specify other medical conditions"
                                    className="other-input"
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Allergies</label>
                        <div className="checkbox-grid">
                            {allergiesOptions.map((option, index) => (
                                <div key={index} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        id={`allergies-${index}`}
                                        checked={formData.allergies.includes(option)}
                                        onChange={() => handleCheckboxChange('allergies', option)}
                                    />
                                    <label htmlFor={`allergies-${index}`}>{option}</label>
                                </div>
                            ))}
                        </div>
                        {formData.allergies.includes('Other') && (
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="allergiesOther"
                                    value={formData.allergiesOther}
                                    onChange={handleChange}
                                    placeholder="Specify other allergies"
                                    className="other-input"
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Current Medications</label>
                        <div className="checkbox-grid">
                            {medicationsOptions.map((option, index) => (
                                <div key={index} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        id={`medications-${index}`}
                                        checked={formData.medications.includes(option)}
                                        onChange={() => handleCheckboxChange('medications', option)}
                                    />
                                    <label htmlFor={`medications-${index}`}>{option}</label>
                                </div>
                            ))}
                        </div>
                        {formData.medications.includes('Other') && (
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="medicationsOther"
                                    value={formData.medicationsOther}
                                    onChange={handleChange}
                                    placeholder="Specify other medications"
                                    className="other-input"
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Current Symptoms</label>
                        <div className="checkbox-grid">
                            {symptomsOptions.map((option, index) => (
                                <div key={index} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        id={`symptoms-${index}`}
                                        checked={formData.currentSymptoms.includes(option)}
                                        onChange={() => handleCheckboxChange('currentSymptoms', option)}
                                    />
                                    <label htmlFor={`symptoms-${index}`}>{option}</label>
                                </div>
                            ))}
                        </div>
                        {formData.currentSymptoms.includes('Other') && (
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="currentSymptomsOther"
                                    value={formData.currentSymptomsOther}
                                    onChange={handleChange}
                                    placeholder="Specify other symptoms"
                                    className="other-input"
                                />
                            </div>
                        )}
                    </div>
                </fieldset>

                {/* Insurance Information Section */}
                <fieldset className="form-section">
                    <legend>Insurance Information</legend>

                    <div className="form-group checkbox-group">
                        <input
                            type="checkbox"
                            id="hasInsurance"
                            name="hasInsurance"
                            checked={formData.hasInsurance}
                            onChange={handleChange}
                        />
                        <label htmlFor="hasInsurance">Do you have health insurance?</label>
                    </div>

                    {formData.hasInsurance && (
                        <>
                            <div className="form-group">
                                <label>Insurance Provider</label>
                                <select
                                    name="insuranceProvider"
                                    value={formData.insuranceProvider}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Provider</option>
                                    {insuranceProviders.map(provider => (
                                        <option key={provider} value={provider}>{provider}</option>
                                    ))}
                                </select>
                                {formData.insuranceProvider === 'Other' && (
                                    <input
                                        type="text"
                                        name="insuranceProviderOther"
                                        value={formData.insuranceProviderOther}
                                        onChange={handleChange}
                                        placeholder="Specify provider"
                                        className="other-input"
                                    />
                                )}
                            </div>

                            <div className="form-group">
                                <label>Policy Number</label>
                                <input
                                    type="text"
                                    name="policyNumber"
                                    value={formData.policyNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}
                </fieldset>

                <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Medical Information'}
                </button>
            </form>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};

export default MedicalForm;
