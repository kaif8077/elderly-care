import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import aboutHero from '../assests/about-hero.jpg';
import './Profile.css';
import UserIdCard from '../components/UserIdCard';
import Recommendations from '../components/Recommendations';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [medicalProfile, setMedicalProfile] = useState(null);
    const [qrCode, setQrCode] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [photoUrl, setPhotoUrl] = useState('');
    const [photoBusy, setPhotoBusy] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');

                const medicalResponse = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URI}/api/medical/${user._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const qrResponse = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URI}/api/qr/${user._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setMedicalProfile(medicalResponse.data);
                setQrCode(qrResponse.data.qrCode.data);
                if (medicalResponse.data.profilePhoto) {
                    const photoResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/medical/${user._id}/photo`, {
                        headers: { Authorization: `Bearer ${token}` }, responseType: 'blob'
                    });
                    setPhotoUrl(URL.createObjectURL(photoResponse.data));
                }
            } catch (error) {
                toast.error('Failed to load profile data');
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const uploadPhoto = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
            toast.error('Choose a JPEG, PNG, or WebP image up to 3 MB.');
            return;
        }
        setPhotoBusy(true);
        try {
            const body = new FormData();
            body.append('photo', file);
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/medical/${user._id}/photo`, body, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const photoResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/medical/${user._id}/photo`, {
                headers: { Authorization: `Bearer ${token}` }, responseType: 'blob'
            });
            if (photoUrl) URL.revokeObjectURL(photoUrl);
            setPhotoUrl(URL.createObjectURL(photoResponse.data));
            toast.success('Profile photograph updated.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to upload photograph.');
        } finally {
            setPhotoBusy(false);
        }
    };

    const removePhoto = async () => {
        if (!window.confirm('Remove your profile photograph?')) return;
        setPhotoBusy(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_BACKEND_URI}/api/medical/${user._id}/photo`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (photoUrl) URL.revokeObjectURL(photoUrl);
            setPhotoUrl('');
            toast.success('Profile photograph removed.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to remove photograph.');
        } finally {
            setPhotoBusy(false);
        }
    };
    if (isLoading) {
        return (
            <div className="profile-page">
                <div className="loading-message">Loading profile data...</div>
            </div>
        );
    }
    const formatArrayData = (data) => {
        if (!data) return 'None reported';
        if (Array.isArray(data)) {
            return data.filter(item => item && item !== 'None').join(', ') || 'None reported';
        }
        return data || 'None reported';
    };

    return (
        <div className="profile-page">
            <div className="profile-hero" style={{ backgroundImage: `url(${aboutHero})` }}>
                <div className="hero-overlay">
                    <h1>My Profile</h1>
                    <p>View your personal and medical information</p>
                </div>
            </div>

            <div className="profile-container">
                <ToastContainer position="top-right" autoClose={3000} />

                <div className="profile-header">
                    <h1 className="profile-title">Welcome, {medicalProfile?.name || 'User'}</h1>
                </div>
                <section className="profile-photo-panel" aria-labelledby="profile-photo-title">
                    <div className="profile-photo-preview">
                        {photoUrl ? <img src={photoUrl} alt={`${medicalProfile?.name || 'User'} profile`} /> : <span aria-hidden="true">{medicalProfile?.name?.charAt(0)?.toUpperCase() || 'U'}</span>}
                    </div>
                    <div>
                        <h2 id="profile-photo-title">Profile photograph</h2>
                        <p>JPEG, PNG, or WebP. Maximum 3 MB. Stored privately and available only through authenticated access.</p>
                        <div className="profile-photo-actions">
                            <label className="profile-photo-upload">
                                {photoBusy ? 'Working...' : photoUrl ? 'Replace photograph' : 'Upload photograph'}
                                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={photoBusy} />
                            </label>
                            {photoUrl && <button type="button" onClick={removePhoto} disabled={photoBusy}>Remove</button>}
                        </div>
                    </div>
                </section>

                <div className="profile-section">
                    <h2 className="section-title">Personal Information</h2>
                    <div className="profile-grid">
                        <div className="info-card">
                            <p><strong>Full Name:</strong> {medicalProfile?.name || 'N/A'}</p>
                            <p><strong>Date of Birth:</strong> {medicalProfile?.dob || 'N/A'}</p>
                            <p><strong>Gender:</strong> {medicalProfile?.gender || 'N/A'}</p>
                            <p><strong>Diet Preference:</strong> {medicalProfile?.dietPreference ? `${medicalProfile.dietPreference} ` : 'N/A'}</p>
                        </div>
                        <div className="info-card">
                            <p><strong>Blood Group:</strong> {medicalProfile?.bloodGroup || 'N/A'}</p>
                            <p><strong>Height:</strong> {medicalProfile?.height ? `${medicalProfile.height} cm` : 'N/A'}</p>
                            <p><strong>Weight:</strong> {medicalProfile?.weight ? `${medicalProfile.weight} kg` : 'N/A'}</p>

                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h2 className="section-title">Contact Details</h2>
                    <div className="profile-grid">
                        <div className="info-card">
                            <p><strong>Phone Number:</strong> {medicalProfile?.phone || 'N/A'}</p>
                            <p><strong>Address:</strong> {medicalProfile?.address || 'N/A'}</p>
                        </div>
                        <div className="info-card">
                            <p><strong>Emergency Contact:</strong> {medicalProfile?.emergencyContact || 'N/A'}</p>
                            <p><strong>Emergency Phone:</strong> {medicalProfile?.emergencyPhone || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h2 className="section-title">Medical Information</h2>
                    <div className="profile-grid">
                        <div className="info-card">
                            <p><strong>Medical History:</strong> {formatArrayData(medicalProfile?.medicalHistory)}</p>
                            <p><strong>Allergies:</strong> {formatArrayData(medicalProfile?.allergies)}</p>
                        </div>
                        <div className="info-card">
                            <p><strong>Current Medications:</strong> {formatArrayData(medicalProfile?.medications)}</p>
                            <p><strong>Current Symptoms:</strong> {formatArrayData(medicalProfile?.currentSymptoms)}</p>
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h2 className="section-title">Insurance Information</h2>
                    <div className="profile-grid">
                        <div className="info-card">
                            <p><strong>Insurance Status:</strong> {medicalProfile?.hasInsurance ? 'Active' : 'Not Active'}</p>
                            {medicalProfile?.hasInsurance && (
                                <>
                                    <p><strong>Provider:</strong> {medicalProfile?.insuranceProvider || 'N/A'}</p>
                                    <p><strong>Policy Number:</strong> {medicalProfile?.policyNumber || 'N/A'}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <section className="profile-section"><Recommendations /></section>
                <UserIdCard profile={medicalProfile} qrCode={qrCode} photoUrl={photoUrl} />
            </div>

            <footer className="footer-section">
                <p>&copy; {new Date().getFullYear()} ElderlyCare. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Profile;