import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [resetData, setResetData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
        tempToken: ''
    });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

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
        if (/[@$!%*?&]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 0: return '#ccc';
            case 1: return '#ff4d4d';
            case 2: return '#ffa500';
            case 3: return '#ffcc00';
            case 4: return '#66cc66';
            case 5: return '#009900';
            default: return '#ccc';
        }
    };

    const handleResetChange = (e) => {
        const { name, value } = e.target;
        setResetData(prev => ({ ...prev, [name]: value }));

        if (name === 'newPassword') {
            checkResetPasswordStrength(value);
        }
    };

    const checkResetPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[@$!%*?&]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/auth/login`, formData);

            if (response.data?.token && response.data?.user) {
                localStorage.setItem("token", response.data.token);
                login(response.data.user);

                toast.success("Login successful! Redirecting...", {
                    autoClose: 1000
                });

                setTimeout(() => navigate('/dashboard'), 1500);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (resetStep === 1) {
                await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/auth/forgot-password`, {
                    email: resetData.email
                });
                toast.success("OTP sent to your email");
                setResetStep(2);
            } else if (resetStep === 2) {
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/auth/verify-reset-otp`, {
                    email: resetData.email,
                    otp: resetData.otp
                });
                toast.success("OTP verified");
                setResetData(prev => ({ ...prev, tempToken: response.data.tempToken }));
                setResetStep(3);
            } else if (resetStep === 3) {
                if (resetData.newPassword !== resetData.confirmPassword) {
                    toast.error("Passwords don't match");
                    return;
                }

                await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/auth/reset-password`, {
                    email: resetData.email,
                    newPassword: resetData.newPassword,
                    tempToken: resetData.tempToken
                });

                toast.success("Password reset successfully. You can now login.");
                setIsForgotPassword(false);
                setResetStep(1);
                setResetData({
                    email: '',
                    otp: '',
                    newPassword: '',
                    confirmPassword: '',
                    tempToken: ''
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const resendResetOTP = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/auth/forgot-password`, {
                email: resetData.email
            });
            toast.success("New OTP sent to your email");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend OTP");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-modal">
                <button className="close-btn" onClick={() => navigate('/')} aria-label="Close">
                    &times;
                </button>

                {!isForgotPassword ? (
                    <>
                        <div className="auth-header">
                            <h2>Login to Your Account</h2>
                            <p>Welcome back!</p>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label htmlFor="login-email">Email Address</label>
                                <input
                                    type="email"
                                    id="login-email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="login-password">Password</label>
                                <div className="password-input-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="login-password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '🔓' : '🔒'}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="forgot-password-btn"
                                    onClick={() => setIsForgotPassword(true)}
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <button type="submit" disabled={loading} className="submit-btn">
                                {loading ? (
                                    <>
                                        <span className="spinner" aria-hidden="true"></span> Logging In...
                                    </>
                                ) : 'Login'}
                            </button>

                            <div className="auth-footer">
                                <p>Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link></p>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <div className="auth-header">
                            <h2>
                                {resetStep === 1 && 'Forgot Password'}
                                {resetStep === 2 && 'Verify OTP'}
                                {resetStep === 3 && 'Reset Password'}
                            </h2>
                            <p>
                                {resetStep === 1 && 'Enter your email to receive a reset code'}
                                {resetStep === 2 && `We sent a code to ${resetData.email}`}
                                {resetStep === 3 && 'Enter your new password'}
                            </p>
                        </div>

                        <form onSubmit={handleForgotPassword}>
                            {resetStep === 1 && (
                                <div className="form-group">
                                    <label htmlFor="reset-email">Email Address</label>
                                    <input
                                        type="email"
                                        id="reset-email"
                                        name="email"
                                        value={resetData.email}
                                        onChange={handleResetChange}
                                        required
                                    />
                                </div>
                            )}

                            {resetStep === 2 && (
                                <div className="form-group">
                                    <label htmlFor="reset-otp">Enter 6-digit OTP</label>
                                    <input
                                        type="text"
                                        id="reset-otp"
                                        name="otp"
                                        value={resetData.otp}
                                        onChange={handleResetChange}
                                        maxLength="6"
                                        required
                                    />
                                    <div className="resend-otp">
                                        Didn't receive code? <button type="button" onClick={resendResetOTP}>Resend OTP</button>
                                    </div>
                                </div>
                            )}

                            {resetStep === 3 && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="new-password">New Password</label>
                                        <div className="password-input-container">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="new-password"
                                                name="newPassword"
                                                value={resetData.newPassword}
                                                onChange={handleResetChange}
                                                required
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
                                        {resetData.newPassword && (
                                            <div className="password-requirements">
                                                <p>Password must contain:</p>
                                                <ul>
                                                    <li className={resetData.newPassword.length >= 8 ? 'valid' : 'invalid'}>
                                                        At least 8 characters
                                                    </li>
                                                    <li className={/[A-Z]/.test(resetData.newPassword) ? 'valid' : 'invalid'}>
                                                        One uppercase letter
                                                    </li>
                                                    <li className={/[a-z]/.test(resetData.newPassword) ? 'valid' : 'invalid'}>
                                                        One lowercase letter
                                                    </li>
                                                    <li className={/\d/.test(resetData.newPassword) ? 'valid' : 'invalid'}>
                                                        One number
                                                    </li>
                                                    <li className={/[@$!%*?&]/.test(resetData.newPassword) ? 'valid' : 'invalid'}>
                                                        One special character (@$!%*?&)
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirm-password">Confirm Password</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="confirm-password"
                                            name="confirmPassword"
                                            value={resetData.confirmPassword}
                                            onChange={handleResetChange}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <button type="submit" disabled={loading} className="submit-btn">
                                {loading ? (
                                    <>
                                        <span className="spinner" aria-hidden="true"></span>
                                        {resetStep === 1 && 'Sending...'}
                                        {resetStep === 2 && 'Verifying...'}
                                        {resetStep === 3 && 'Resetting...'}
                                    </>
                                ) : (
                                    <>
                                        {resetStep === 1 && 'Send OTP'}
                                        {resetStep === 2 && 'Verify OTP'}
                                        {resetStep === 3 && 'Reset Password'}
                                    </>
                                )}
                            </button>

                            <div className="auth-footer">
                                <p>
                                    Remember your password?
                                    <button
                                        type="button"
                                        className="auth-link"
                                        onClick={() => {
                                            setIsForgotPassword(false);
                                            setResetStep(1);
                                        }}
                                    >
                                        Login
                                    </button>
                                </p>
                            </div>
                        </form>
                    </>
                )}
            </div>
            {/* <ToastContainer /> */}
        </div>
    );
};

export default Login;