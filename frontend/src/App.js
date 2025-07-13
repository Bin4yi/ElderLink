// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { SubscriptionProvider } from './context/SubscriptionContext';

// Components
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './components/auth/Login';

// Admin
import AdminDashboard from './components/admin/dashboard/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import AdminPortal from './pages/AdminPortal';

// Doctor
import DoctorDashboard from './components/doctor/dashboard/DoctorDashboard';

// Family
import FamilyDashboard from './components/family/dashboard/FamilyDashboard';
import AppointmentBooking from './components/family/dashboard/appointmentBooking'; // ADD THIS IMPORT

// Pharmacy
import PharmacyDashboard from './components/pharmacist/dashboard/PharmacyDashboard';
import MedicationManagement from './components/pharmacist/medications/MedicationManagement';
import DeliverySchedule from './components/pharmacist/delivery/DeliverySchedule';
import PrescriptionManagement from './components/pharmacist/prescriptions/PrescriptionManagement';
import InventoryManagement from './components/pharmacist/inventory/InventoryManagement';
import AddNewItem from './components/pharmacist/inventory/AddNewItem';
import PharmacyProfile from './components/pharmacist/profile/Pharmacyprofile';
import MedicineProfile from './components/pharmacist/inventory/MedicineProfile';

// Staff
import StaffDashboard from './components/staff/dashboard/StaffDashboard';
import AlertsManagement from './components/staff/alerts/AlertsManagement';
import HealthMonitoring from './components/staff/monitoring/HealthMonitoring';
import CareManagement from './components/staff/care/CareManagement';
import Report from './components/staff/reports/Report';
import Profilestaff from './components/staff/profile/Profilestaff';

// Elder
import ElderDashboard from './components/Elder/dashboard/Elder';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SubscriptionProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Role-specific dashboards */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/family/dashboard" element={<FamilyDashboard />} />
              <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              
              {/* NEW: Elder routes */}
              <Route path="/elder/dashboard" element={<ElderDashboard />} />
              
              {/* Family routes - ADD THIS */}
              <Route path="/family/appointmentBooking" element={<AppointmentBooking />} />
              
              {/* Staff routes */}
              <Route path="/staff/care" element={<CareManagement />} />

              {/* Doctor routes */}
              <Route path="/doctor/patients" element={<PatientList />} />
              <Route path="/doctor/appointments" element={<AppointmentManagement />} />
              <Route path="/doctor/consultations" element={<ConsultationHistory />} />
              <Route path="/doctor/records" element={<MedicalRecords />} />
              
            </Routes>
            
            {/* Toast notifications */}
            <Toaster 
              position="top-right"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                className: '',
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: 'green',
                    secondary: 'black',
                  },
                },
              }}
            />
          </div>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
