import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Auth.css';

const Register = () => {
    const [step, setStep] = useState(1); // 1: register, 2: verify, 3: complete
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        otp: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    };

    const validateForm = () => {
        const newErrors = {};
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        
        if (step === 1) {
            if (!formData.name.trim()) newErrors.name = 'Name is required';
            if (!formData.email) newErrors.email = 'Email is required';
            else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email';
            if (!formData.password) newErrors.password = 'Password is required';
            else if (!strongPasswordRegex.test(formData.password)) {
                newErrors.password = 'Password must contain 8+ chars with uppercase, lowercase, number & special character';
            }
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        } else if (step === 2) {
            if (!formData.otp || formData.otp.length !== 6) newErrors.otp = 'Please enter a valid 6-digit OTP';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (step === 1) {
                // Send registration request to get OTP
                const { confirmPassword, ...dataToSend } = formData;
                await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/auth/register`, dataToSend);
                
                toast.success("OTP sent to your email");
                setStep(2);
            } else if (step === 2) {
                // Verify OTP
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/auth/verify-otp`, {
                    email: formData.email,
                    otp: formData.otp
                });
                
                toast.success("Email verified successfully");
                setStep(3);
            } else if (step === 3) {
                // Complete registration
                const { confirmPassword, otp, ...dataToSend } = formData;
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/auth/complete-registration`, dataToSend);
                
                localStorage.setItem("token", response.data.token);
                toast.success("Registration successful! Redirecting...", { autoClose: 2000 });
                setTimeout(() => navigate('/Login'), 2500);
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const resendOTP = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/auth/register`, {
                email: formData.email,
                name: formData.name
            });
            toast.success("New OTP sent to your email");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend OTP");
        }
    };

    const getPasswordStrengthColor = () => {
        switch(passwordStrength) {
            case 0: return '#ccc';
            case 1: return '#ff4d4d';
            case 2: return '#ffa500';
            case 3: return '#ffcc00';
            case 4: return '#66cc66';
            case 5: return '#009900';
            default: return '#ccc';
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-modal">
                <button className="close-btn" onClick={() => navigate('/')} aria-label="Close">
                    &times;
                </button>
                
                <div className="auth-header">
                    <h2>
                        {step === 1 && 'Create Account'}
                        {step === 2 && 'Verify Email'}
                        {step === 3 && 'Complete Registration'}
                    </h2>
                    <p>
                        {step === 1 && 'Join our community today'}
                        {step === 2 && `We sent a code to ${formData.email}`}
                        {step === 3 && 'Just one more step'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    {step === 1 && (
                        <>
                            <div className="form-group">
                                <label htmlFor="name">Full Name*</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email*</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
    <label htmlFor="password">Password*</label>
    <div className="password-input-container">
        <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
        />
        <button 
            type="button" 
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
        >
            {showPassword ? '🔓' : '🔒'}
        </button>
    </div>
    <div className="password-strength-meter">
        <div 
            className="strength-bar" 
            style={{
                width: `${passwordStrength * 20}%`,
                backgroundColor: getPasswordStrengthColor()
            }}
        ></div>
    </div>
    {formData.password && (
        <div className="password-requirements">
            <p>Password must contain:</p>
            <ul>
                <li className={formData.password.length >= 8 ? 'valid' : 'invalid'}>
                    At least 8 characters
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'valid' : 'invalid'}>
                    One uppercase letter
                </li>
                <li className={/[a-z]/.test(formData.password) ? 'valid' : 'invalid'}>
                    One lowercase letter
                </li>
                <li className={/\d/.test(formData.password) ? 'valid' : 'invalid'}>
                    One number
                </li>
                <li className={/[@$!%*?&]/.test(formData.password) ? 'valid' : 'invalid'}>
                    One special character (@$!%*?&)
                </li>
            </ul>
        </div>
    )}
    {errors.password && <span className="error-message">{errors.password}</span>}
</div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password*</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={errors.confirmPassword ? 'error' : ''}
                                />
                                {errors.confirmPassword && (
                                    <span className="error-message">{errors.confirmPassword}</span>
                                )}
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div className="form-group">
                            <label htmlFor="otp">Enter 6-digit OTP*</label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                maxLength="6"
                                className={errors.otp ? 'error' : ''}
                            />
                            {errors.otp && <span className="error-message">{errors.otp}</span>}
                            <div className="resend-otp">
                                Didn't receive code? <button type="button" onClick={resendOTP}>Resend OTP</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="form-group">
                            <p>Almost done! Click the button below to complete your registration.</p>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? (
                            <>
                                <span className="spinner" aria-hidden="true"></span> 
                                {step === 1 && 'Processing...'}
                                {step === 2 && 'Verifying...'}
                                {step === 3 && 'Completing...'}
                            </>
                        ) : (
                            <>
                                {step === 1 && 'Register'}
                                {step === 2 && 'Verify OTP'}
                                {step === 3 && 'Complete Registration'}
                            </>
                        )}
                    </button>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
                    </div>
                </form>
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default Register;