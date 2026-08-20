import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import AdminLayout from './admin/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import MemberPortalLayout from './components/MemberPortalLayout';

// Route-level loading keeps admin, PDF, and member tools out of the initial public bundle.
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const MedicalReports = React.lazy(() => import('./pages/MedicalReports'));
const EmergencyProfile = React.lazy(() => import('./pages/EmergencyProfile'));
const About = React.lazy(() => import('./pages/About'));
const Services = React.lazy(() => import('./pages/Services'));
const Contact = React.lazy(() => import('./pages/Contact'));
const CareInvitation = React.lazy(() => import('./pages/CareInvitation'));
const AlertAcknowledge = React.lazy(() => import('./pages/AlertAcknowledge'));
const EmergencyContactVerification = React.lazy(
  () => import('./pages/EmergencyContactVerification')
);
const EmergencyAlerts = React.lazy(() => import('./pages/EmergencyAlerts'));
const MedicalProfilePage = React.lazy(() => import('./pages/MedicalProfilePage'));
const RecommendationsPage = React.lazy(() => import('./pages/RecommendationsPage'));
const DocumentsPage = React.lazy(() => import('./pages/DocumentsPage'));
const MemberEmergencyPage = React.lazy(() => import('./pages/MemberEmergencyPage'));
const AdminLogin = React.lazy(() => import('./admin/pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./admin/pages/AdminDashboard'));
const AdminUsers = React.lazy(() => import('./admin/pages/AdminUsers'));
const AdminUserDetail = React.lazy(() => import('./admin/pages/AdminUserDetail'));
const AdminIdCard = React.lazy(() => import('./admin/pages/AdminIdCard'));
const AdminAuditLogs = React.lazy(() => import('./admin/pages/AdminAuditLogs'));
const AdminContacts = React.lazy(() => import('./admin/pages/AdminContacts'));
const AdminEmergencyAlerts = React.lazy(() => import('./admin/pages/AdminEmergencyAlerts'));

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isEmergencyRoute = location.pathname.startsWith('/emergency/');
  const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isMemberRoute = [
    '/dashboard',
    '/profile',
    '/medical-profile',
    '/recommendations',
    '/emergency',
    '/documents',
    '/emergency-alerts',
    '/reports'
  ].includes(location.pathname);

  return (
    <>
      {!isAdminRoute && !isEmergencyRoute && !isMemberRoute && !isAuthRoute && <Navbar />}
      <React.Suspense
        fallback={
          <div role="status" aria-live="polite">
            Loading page…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            element={
              <ProtectedRoute>
                <MemberPortalLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/medical-profile" element={<MedicalProfilePage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/emergency" element={<MemberEmergencyPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/emergency-alerts" element={<EmergencyAlerts />} />
            <Route path="/reports" element={<MedicalReports />} />
          </Route>
          <Route path="/emergency/:token" element={<EmergencyProfile />} />
          <Route path="/services" element={<Services />} />
          <Route
            path="/care-invitation/:token"
            element={
              <ProtectedRoute>
                <CareInvitation />
              </ProtectedRoute>
            }
          />
          <Route path="/alert-acknowledge/:token" element={<AlertAcknowledge />} />
          <Route
            path="/verify-emergency-contact/:token"
            element={<EmergencyContactVerification />}
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="emergency-alerts" element={<AdminEmergencyAlerts />} />
            <Route path="users/:userId" element={<AdminUserDetail />} />
            <Route path="id-cards/:userId" element={<AdminIdCard />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="contacts" element={<AdminContacts />} />
          </Route>
        </Routes>
      </React.Suspense>
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
