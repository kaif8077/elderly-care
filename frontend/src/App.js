import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import About from './pages/About'; 
import Services from './pages/Services';
import Contact from './pages/Contact';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboardPlaceholder from './admin/pages/AdminDashboardPlaceholder';
import './App.css';

const AppRoutes = () => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <>
            {!isAdminRoute && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />  
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/services" element={<Services />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                    path="/admin/dashboard"
                    element={(
                        <AdminProtectedRoute>
                            <AdminDashboardPlaceholder />
                        </AdminProtectedRoute>
                    )}
                />
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <Router>
            <AdminAuthProvider>
                <AppRoutes />
            </AdminAuthProvider>
        </Router>
    );
};

export default App;
