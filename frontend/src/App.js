// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './context/AuthContext';

// Public Pages
import Landing from './pages/Landing';

// Family Member Components
import FamilyDashboard from './components/family/dashboard/FamilyDashboard';
import FamilyProfile from './components/family/profile/FamilyProfile';

// Admin Components
import AdminDashboard from './components/admin/dashboard/AdminDashboard';
import UserManagement from './components/admin/users/UserManagement';
import PackageManagement from './components/admin/packages/PackageManagement';
import SystemAnalytics from './components/admin/analytics/SystemAnalytics';

// Doctor Components
import DoctorDashboard from './components/doctor/dashboard/DoctorDashboard';
import PatientList from './components/doctor/patients/PatientList';
import ConsultationHistory from './components/doctor/consultations/ConsultationHistory';
import AppointmentList from './components/doctor/appointments/AppointmentList';

// Staff Components
import StaffDashboard from './components/staff/dashboard/StaffDashboard';
import CareManagement from './components/staff/care/CareManagement';
import HealthMonitoring from './components/staff/monitoring/HealthMonitoring';
import AlertsManagement from './components/staff/monitoring/AlertsManagement';

// Pharmacist Components
import PharmacyDashboard from './components/pharmacist/dashboard/PharmacyDashboard';
import MedicationManagement from './components/pharmacist/medications/MedicationManagement';
import DeliverySchedule from './components/pharmacist/delivery/DeliverySchedule';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Helper component to redirect based on role
const RoleRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  switch (user.role) {
    case 'family_member':
      return <Navigate to="/family/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'doctor':
      return <Navigate to="/doctor/dashboard" replace />;
    case 'staff':
      return <Navigate to="/staff/dashboard" replace />;
    case 'pharmacist':
      return <Navigate to="/pharmacy/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              
              {/* Family Member Routes */}
              <Route 
                path="/family/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['family_member']}>
                    <FamilyDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/family/profile" 
                element={
                  <ProtectedRoute allowedRoles={['family_member']}>
                    <FamilyProfile />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/packages" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PackageManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SystemAnalytics />
                  </ProtectedRoute>
                } 
              />

              {/* Doctor Routes */}
              <Route 
                path="/doctor/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor/patients" 
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <PatientList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor/consultations" 
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <ConsultationHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor/appointments" 
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <AppointmentList />
                  </ProtectedRoute>
                } 
              />

              {/* Staff Routes */}
              <Route 
                path="/staff/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/staff/care-management" 
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <CareManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/staff/monitoring" 
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <HealthMonitoring />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/staff/alerts" 
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <AlertsManagement />
                  </ProtectedRoute>
                } 
              />

              {/* Pharmacist Routes */}
              <Route 
                path="/pharmacy/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['pharmacist']}>
                    <PharmacyDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pharmacy/medications" 
                element={
                  <ProtectedRoute allowedRoles={['pharmacist']}>
                    <MedicationManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pharmacy/delivery" 
                element={
                  <ProtectedRoute allowedRoles={['pharmacist']}>
                    <DeliverySchedule />
                  </ProtectedRoute>
                } 
              />

              {/* Redirect based on user role */}
              <Route path="/dashboard" element={<RoleRedirect />} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;