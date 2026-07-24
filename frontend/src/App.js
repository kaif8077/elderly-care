import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import MedicalReports from './pages/MedicalReports';
import EmergencyProfile from './pages/EmergencyProfile';
import About from './pages/About'; 
import Services from './pages/Services';
import Contact from './pages/Contact';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboardPlaceholder from './admin/pages/AdminDashboardPlaceholder';
import AdminLayout from './admin/layout/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminUsers from './admin/pages/AdminUsers';
import AdminUserDetail from './admin/pages/AdminUserDetail';
import AdminIdCard from './admin/pages/AdminIdCard';
import AdminAuditLogs from './admin/pages/AdminAuditLogs';
import AdminReports from './admin/pages/AdminReports';
import AdminContacts from './admin/pages/AdminContacts';
import AdminFeedback from './admin/pages/AdminFeedback';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const AppRoutes = () => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isEmergencyRoute = location.pathname.startsWith('/emergency/');

    return (
        <>
            {!isAdminRoute && !isEmergencyRoute && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />  
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><MedicalReports /></ProtectedRoute>} />
                <Route path="/emergency/:token" element={<EmergencyProfile />} />
                <Route path="/services" element={<Services />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                    path="/admin"
                    element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}
                >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="users/:userId" element={<AdminUserDetail />} />
                    <Route path="id-cards/:userId" element={<AdminIdCard />} />
                    <Route path="audit-logs" element={<AdminAuditLogs />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="contacts" element={<AdminContacts />} />
                    <Route path="feedback" element={<AdminFeedback />} />
                    <Route path="phase-1" element={<AdminDashboardPlaceholder />} />
                </Route>
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AdminAuthProvider>
                <AppRoutes />
            </AdminAuthProvider>
        </Router>
    );
};

export default App;
