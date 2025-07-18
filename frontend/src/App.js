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
import PatientList from './components/doctor/patients/PatientList';
import AppointmentManagement from './components/doctor/appointments/AppointmentManagement';
import ConsultationHistory from './components/doctor/consultations/ConsultationHistory';
import MedicalRecords from './components/doctor/records/MedicalRecords';

// Family
import FamilyDashboard from './components/family/dashboard/FamilyDashboard';
import AppointmentList from './components/family/appointments/AppointmentList';
import Doctors from './components/family/doctors/Doctors';
import DoctorAssignment from './components/family/doctors/DoctorAssignment'; // NEW IMPORT

// Pharmacy
import PharmacyDashboard from './components/pharmacist/dashboard/PharmacyDashboard';
import MedicationManagement from './components/pharmacist/medications/MedicationManagement';
import DeliverySchedule from './components/pharmacist/delivery/DeliverySchedule';
import PrescriptionManagement from './components/pharmacist/prescriptions/PrescriptionManagement';
import InventoryManagement from './components/pharmacist/inventory/InventoryManagement';
import AddNewItem from './components/pharmacist/inventory/AddNewItem';
import PharmacyProfile from './components/pharmacist/profile/Pharmacyprofile';
import MedicineProfile from './components/pharmacist/inventory/MedicineProfile';

// Mental Health Consultant Components
import MentalHealthDashboard from './components/mental-health/dashboard/MentalHealthDashboard';
import MentalHealthProfile from './components/mental-health/profile/Profile';
import MentalHealthClients from './components/mental-health/pations/clients';
import ProgressReport from './components/mental-health/p-reports/p-report';
import TreatmentPlans from './components/mental-health/t-plans/t-plans';
import MentalHealthAssessments from './components/mental-health/assessments/assessments';
import MentalHealthResources from './components/mental-health/m-resources/resources';
import MentalHealthTherapySessions from './components/mental-health/sessions/sessions';

// Staff
import StaffDashboard from './components/staff/dashboard/StaffDashboard';
import AlertsManagement from './components/staff/alerts/AlertsManagement';
import HealthMonitoring from './components/staff/monitoring/HealthMonitoring';
import CareManagement from './components/staff/care/CareManagement';
import Profilestaff from './components/staff/profile/Profilestaff';
import MentalHealthManagement from './components/staff/mental/Mental';
import HealthReports from './components/staff/reports/HealthReports';

// Elder
import ElderDashboard from './components/Elder/dashboard/Elder';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SubscriptionProvider>
          <InventoryProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/portal" element={<AdminPortal />} />
                  
                  {/* Doctor routes */}
                  <Route path="/doctor/patients" element={<PatientList />} />
                  <Route path="/doctor/appointments" element={<AppointmentManagement />} />
                  <Route path="/doctor/consultations" element={<ConsultationHistory />} />
                  <Route path="/doctor/records" element={<MedicalRecords />} />
                  <Route path="/appointment-booking" element={<AppointmentBooking />} />
                  
                  {/* Family routes */}
                  <Route path="/family/dashboard" element={<FamilyDashboard />} />
                  <Route path="/family/appointments" element={<AppointmentList />} />
                  <Route path="/family/doctors" element={<Doctors />} />
                  
                  {/* Pharmacy routes */}
                  <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
                  <Route path="/pharmacy/medications" element={<MedicationManagement />} />
                  <Route path="/pharmacy/delivery" element={<DeliverySchedule />} />
                  <Route path="/pharmacy/prescriptions" element={<PrescriptionManagement />} />
                  <Route path="/pharmacy/inventory" element={<InventoryManagement />} />
                  <Route path="/pharmacy/inventory/add" element={<AddNewItem />} />
                  <Route path="/pharmacy/profile" element={<PharmacyProfile />} />
                  <Route path="/pharmacy/medicine/:id" element={<MedicineProfile />} />
                  
                  {/* Mental Health routes */}
                  <Route path="/mental-health/dashboard" element={<MentalHealthDashboard />} />
                  <Route path="/mental-health/profile" element={<MentalHealthProfile />} />
                  <Route path="/mental-health/clients" element={<MentalHealthClients />} />
                  <Route path="/mental-health/progress-reports" element={<ProgressReport />} />
                  <Route path="/mental-health/treatment-plans" element={<TreatmentPlans />} />
                  <Route path="/mental-health/assessments" element={<MentalHealthAssessments />} />
                  <Route path="/mental-health/resources" element={<MentalHealthResources />} />
                  <Route path="/mental-health/therapy-sessions" element={<MentalHealthTherapySessions />} />
                  <Route path="/family/doctors" element={<Doctors />} />
              <Route path="/family/doctor-assignment" element={<DoctorAssignment />} /> {/* NEW ROUTE */}
              
                  {/* Staff routes */}
                  <Route path="/staff/dashboard" element={<StaffDashboard />} />
                  <Route path="/staff/alerts" element={<AlertsManagement />} />
                  <Route path="/staff/monitoring" element={<HealthMonitoring />} />
                  <Route path="/staff/care" element={<CareManagement />} />
                  <Route path="/staff/reports" element={<HealthReports />} />
                  <Route path="/staff/profile" element={<Profilestaff />} />
                  <Route path="/staff/mental" element={<MentalHealthManagement />} />
                  
                  {/* Elder routes */}
                  <Route path="/elder/dashboard" element={<ElderDashboard />} />
              <Route path="/appointment-booking" element={<AppointmentBooking />} />
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
            </Router>
          </InventoryProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;