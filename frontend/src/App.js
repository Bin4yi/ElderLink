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
import AppointmentList from './components/family/appointments/AppointmentList';

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
        <Router>
          <InventoryProvider>
            <SubscriptionProvider>
              <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />

                  {/* Common */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Admin */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin-portal" element={<AdminPortal />} />

                  {/* Doctor */}
                  <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

                  {/* Family */}
                  <Route path="/family/dashboard" element={<FamilyDashboard />} />
                  <Route path="/family/appointments" element={<AppointmentList />} />

                  {/* Pharmacist */}
                  <Route path="/pharmacist/dashboard" element={<PharmacyDashboard />} />
                  <Route path="/pharmacist/medications" element={<MedicationManagement />} />
                  <Route path="/pharmacist/delivery" element={<DeliverySchedule />} />
                  <Route path="/pharmacist/prescriptions" element={<PrescriptionManagement />} />
                  <Route path="/pharmacist/inventory" element={<InventoryManagement />} />
                  <Route path="/pharmacist/inventory/add" element={<AddNewItem />} />
                  <Route path="/pharmacist/inventory/:id" element={<MedicineProfile />} />
                  <Route path="/pharmacist/profile" element={<PharmacyProfile />} />

                  {/* Staff */}
                  <Route path="/staff/dashboard" element={<StaffDashboard />} />
                  <Route path="/staff/care" element={<CareManagement />} />
                  <Route path="/staff/alerts" element={<AlertsManagement />} />
                  <Route path="/staff/monitoring" element={<HealthMonitoring />} />
                  <Route path="/staff/reports" element={<Report />} />
                  <Route path="/staff/profile" element={<Profilestaff />} />

                  {/* Elder */}
                  <Route path="/elder/dashboard" element={<ElderDashboard />} />
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
          </InventoryProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
