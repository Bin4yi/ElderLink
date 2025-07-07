// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { InventoryProvider } from './context/InventoryContext';

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

// Family Components
import FamilyDashboard from './components/family/dashboard/FamilyDashboard';

// Pharmacy Components
import PharmacyDashboard from './components/pharmacist/dashboard/PharmacyDashboard';
import MedicationManagement from './components/pharmacist/medications/MedicationManagement';
import DeliverySchedule from './components/pharmacist/delivery/DeliverySchedule';
import PrescriptionManagement from './components/pharmacist/prescriptions/PrescriptionManagement';
import InventoryManagement from './components/pharmacist/inventory/InventoryManagement';
import AddNewItem from './components/pharmacist/inventory/AddNewItem';
import PharmacyProfile from './components/pharmacist/profile/Pharmacyprofile';
import MedicineProfile from './components/pharmacist/inventory/MedicineProfile';

// Staff Components
import StaffDashboard from './components/staff/dashboard/StaffDashboard';
import AlertsManagement from './components/staff/alerts/AlertsManagement';
import HealthMonitoring from './components/staff/monitoring/HealthMonitoring';
import CareManagement from './components/staff/care/CareManagement';
import Report from './components/staff/reports/Report';
import Profilestaff from './components/staff/profile/Profilestaff';
// Elder Components
import ElderDashboard from './components/Elder/dashboard/Elder';


function App() {
  return (
    <InventoryProvider> {/* ADD THIS WRAPPER */}
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
              <Route path="/pharmacist/dashboard" element={<PharmacyDashboard />} />

              {/* Staff routes */}
                <Route path="/staff/dashboard" element={<StaffDashboard />} />
                 <Route path="/staff/care" element={< CareManagement/>} />
                  <Route path="/staff/alerts" element={<AlertsManagement/>} />
              <Route path="/staff/monitoring" element={<HealthMonitoring />} />
                <Route path="/staff/reports" element={<Report />} />
                  <Route path="/staff/profile" element={<Profilestaff />} />
             
=======
              <Route path="/pharmacist/medications" element={<MedicationManagement />} />
              <Route path="/pharmacist/delivery" element={<DeliverySchedule />} />
              <Route path="/pharmacist/prescriptions" element={<PrescriptionManagement />} />
              <Route path="/pharmacist/inventory" element={<InventoryManagement />} />
              <Route path="/pharmacist/profile" element={<PharmacyProfile />} />
              <Route path="/pharmacist/inventory/add" element={<AddNewItem />} />
              <Route path="/pharmacist/inventory/:id" element={<MedicineProfile />} />

              
            

              

              {/* NEW: Elder routes */}
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
        </SubscriptionProvider> {/* CLOSE THE WRAPPER */}
      </AuthProvider>
    </Router>
    </InventoryProvider> 
  );
}

export default App;