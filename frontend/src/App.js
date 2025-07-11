// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Providers
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext'; // ADD THIS

// Components
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Admin Components
import AdminDashboard from './components/admin/dashboard/AdminDashboard';

// Doctor Components  
import DoctorDashboard from './components/doctor/dashboard/DoctorDashboard';
import PatientList from './components/doctor/patients/PatientList';
import AppointmentList from './components/doctor/appointments/AppointmentList';
import ConsultationHistory from './components/doctor/consultations/ConsultationHistory';
import MedicalRecords from './components/doctor/records/MedicalRecords';



// Family Components
import FamilyDashboard from './components/family/dashboard/FamilyDashboard';

// Pharmacy Components
import PharmacyDashboard from './components/pharmacist/dashboard/PharmacyDashboard';

// Staff Components
import StaffDashboard from './components/staff/dashboard/StaffDashboard';
import CareManagement from './components/staff/care/CareManagement';

// Elder Components
import ElderDashboard from './components/Elder/dashboard/Elder';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider> {/* ADD THIS WRAPPER */}
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
              
              {/* Staff routes */}
              <Route path="/staff/care" element={<CareManagement />} />

              {/* Doctor routes */}
              <Route path="/doctor/patients" element={<PatientList />} />
              <Route path="/doctor/appointments" element={<AppointmentList />} />
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
        </SubscriptionProvider> {/* CLOSE THE WRAPPER */}
      </AuthProvider>
    </Router>
  );
}

export default App;