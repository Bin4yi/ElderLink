// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { InventoryProvider } from "./context/InventoryContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";

// Components
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./components/auth/Login";

// Admin
import AdminDashboard from "./components/admin/dashboard/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import AdminPortal from "./pages/AdminPortal";
import SystemAnalytics from "./components/admin/analytics/SystemAnalytics";

// Coordinator (Ambulance)
import CoordinatorDashboard from "./components/coordinator/CoordinatorDashboard";

// Doctor
import DoctorDashboard from './components/doctor/dashboard/DoctorDashboard';
import PatientList from './components/doctor/patients/PatientList';
import AppointmentManagement from './components/doctor/appointments/AppointmentManagement';
import ConsultationHistory from './components/doctor/consultations/ConsultationHistory';
import MedicalRecords from './components/doctor/records/MedicalRecords';
import PrescriptionList from './components/doctor/prescriptions/PrescriptionList';
import CreatePrescription from './components/doctor/prescriptions/CreatePrescription';


// Family
import FamilyDashboard from "./components/family/dashboard/FamilyDashboard";
import AppointmentList from "./components/family/appointments/AppointmentList";
import MonthlySessions from "./components/family/sessions/MonthlySessions";
import Doctors from "./components/family/doctors/Doctors";
import DoctorAssignment from "./components/family/doctors/DoctorAssignment"; // NEW IMPORT
import AppointmentBooking from "./components/family/appointments/AppointmentBooking";
import FamilySettings from "./components/family/settings/FamilySettings";
import FamilyProfile from "./components/family/profile/FamilyProfile";
import FamilyHealthReports from "./components/family/reports/FamilyHealthReports";
import FamilySubscriptions from "./components/family/subscription/FamilySubscriptions";
import FamilyElders from "./components/family/elder/FamilyElders";
import AppointmentPaymentForm from "./components/family/appointments/AppointmentPaymentForm";
import DoctorCalendarModal from "./components/family/appointments/DoctorCalendarModal";

// Pharmacy
import PharmacyDashboard from './components/pharmacist/dashboard/PharmacyDashboard';
import PharmacistAnalysis from './components/pharmacist/analysis/PharmacistAnalysis';
import DeliverySchedule from './components/pharmacist/delivery/DeliverySchedule';
import PrescriptionManagement from './components/pharmacist/prescriptions/PrescriptionManagement';
import FillPrescription from './components/pharmacist/prescriptions/FillPrescription';
import CreateDelivery from './components/pharmacist/prescriptions/CreateDelivery';
import InventoryManagement from './components/pharmacist/inventory/InventoryManagement';
import AddNewItem from './components/pharmacist/inventory/AddNewItem';
import PharmacyProfile from './components/pharmacist/profile/Pharmacyprofile';
import MedicineProfile from './components/pharmacist/inventory/MedicineProfile';

// Mental Health Consultant Components
import MentalHealthDashboard from "./components/mental-health/dashboard/MentalHealthDashboard";
import MentalHealthProfile from "./components/mental-health/profile/Profile";
import MentalHealthClients from "./components/mental-health/pations/clients";
import ProgressReport from "./components/mental-health/p-reports/p-report";
import TreatmentPlans from "./components/mental-health/t-plans/t-plans";
import MentalHealthAssessments from "./components/mental-health/assessments/assessments";
import MentalHealthResources from "./components/mental-health/m-resources/resources";
import MentalHealthTherapySessions from "./components/mental-health/sessions/sessions";

// Staff
import StaffDashboard from "./components/staff/dashboard/StaffDashboard";
import AlertsManagement from "./components/staff/alerts/AlertsManagement";
import HealthMonitoring from "./components/staff/monitoring/HealthMonitoring";
import CareManagement from "./components/staff/care/CareManagement";
import Profilestaff from "./components/staff/profile/Profilestaff";
import MentalHealthManagement from "./components/staff/mental/Mental";
import TreatmentTasks from "./components/staff/mental/TreatmentTasks";
import HealthReports from "./components/staff/reports/HealthReports";

// Elder
import ElderDashboard from "./components/Elder/dashboard/Elder";
import ElderHealthReports from "./components/Elder/dashboard/ElderHealthReports";
import ElderAppointments from "./components/Elder/dashboard/ElderAppointments";
import ElderMedications from "./components/Elder/dashboard/ElderMedications";
import ElderMentalWellness from "./components/Elder/dashboard/ElderMentalWellness";
import ElderEmergency from "./components/Elder/dashboard/ElderEmergency";
import ElderProfile from "./components/Elder/dashboard/ElderProfile";

const theme = createTheme(); // Add this line

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
                  <Route
                    path="/admin/analytics"
                    element={<SystemAnalytics />}
                  />
                  {/* Coordinator (Ambulance) routes */}
                  <Route
                    path="/coordinator/dashboard"
                    element={<CoordinatorDashboard />}
                  />
                  {/* Doctor routes */}
                  <Route
                    path="/doctor/dashboard"
                    element={<DoctorDashboard />}
                  />
                  <Route path="/doctor/patients" element={<PatientList />} />
                  <Route
                    path="/doctor/appointments"
                    element={<AppointmentManagement />}
                  />
                  <Route
                    path="/doctor/consultations"
                    element={<ConsultationHistory />}
                  />
                  <Route path="/doctor/records" element={<MedicalRecords />} />
                  <Route path="/doctor/prescriptions" element={<PrescriptionList />} />
                  <Route path="/doctor/prescriptions/create" element={<CreatePrescription />} />
                  <Route path="/doctor/prescriptions/create/:elderId" element={<CreatePrescription />} />
                  <Route path="/doctor/prescriptions/create/:elderId/:appointmentId" element={<CreatePrescription />} />
                  
                  {/* Family routes */}
                  <Route
                    path="/family/dashboard"
                    element={<FamilyDashboard />}
                  />
                  <Route
                    path="/family/appointments"
                    element={<AppointmentList />}
                  />
                  <Route
                    path="/family/sessions"
                    element={<MonthlySessions />}
                  />
                  <Route path="/family/doctors" element={<Doctors />} />
                  <Route
                    path="/family/doctor-assignment"
                    element={<DoctorAssignment />}
                  />{" "}
                  {/* NEW ROUTE */}
                  <Route path="/family/settings" element={<FamilySettings />} />
                  <Route path="/family/profile" element={<FamilyProfile />} />
                  <Route
                    path="/family/health-reports"
                    element={<FamilyHealthReports />}
                  />
                  <Route
                    path="/family/subscriptions"
                    element={<FamilySubscriptions />}
                  />
                  <Route path="/family/elders" element={<FamilyElders />} />
                  <Route
                    path="/family/DoctorCalendar"
                    element={<DoctorCalendarModal />}
                  />
                  {/* Pharmacy routes */}
                  <Route path="/pharmacist/dashboard" element={<PharmacyDashboard />} />
                  <Route path="/pharmacist/analysis" element={<PharmacistAnalysis />} />
                  <Route path="/pharmacist/delivery" element={<DeliverySchedule />} />
                  <Route path="/pharmacist/prescriptions" element={<PrescriptionManagement />} />
                  <Route path="/pharmacist/prescriptions/:id/fill" element={<FillPrescription />} />
                  <Route path="/pharmacist/prescriptions/:prescriptionId/create-delivery" element={<CreateDelivery />} />
                  <Route path="/pharmacist/inventory" element={<InventoryManagement />} />
                  <Route path="/pharmacist/inventory/add" element={<AddNewItem />} />
                  <Route path="/pharmacist/profile" element={<PharmacyProfile />} />
                  <Route path="/pharmacist/medicine/:id" element={<MedicineProfile />} />
                  
                  {/* Mental Health routes */}
                  <Route
                    path="/mental-health/dashboard"
                    element={<MentalHealthDashboard />}
                  />
                  <Route
                    path="/mental-health/profile"
                    element={<MentalHealthProfile />}
                  />
                  <Route
                    path="/mental-health/clients"
                    element={<MentalHealthClients />}
                  />
                  <Route
                    path="/mental-health/progress-reports"
                    element={<ProgressReport />}
                  />
                  <Route
                    path="/mental-health/treatment-plans"
                    element={<TreatmentPlans />}
                  />
                  <Route
                    path="/mental-health/assessments"
                    element={<MentalHealthAssessments />}
                  />
                  <Route
                    path="/mental-health/resources"
                    element={<MentalHealthResources />}
                  />
                  <Route
                    path="/mental-health/therapy-sessions"
                    element={<MentalHealthTherapySessions />}
                  />
                  {/* Staff routes */}
                  <Route path="/staff/dashboard" element={<StaffDashboard />} />
                  <Route path="/staff/alerts" element={<AlertsManagement />} />
                  <Route
                    path="/staff/monitoring"
                    element={<HealthMonitoring />}
                  />
                  <Route path="/staff/care" element={<CareManagement />} />
                  <Route path="/staff/reports" element={<HealthReports />} />
                  <Route path="/staff/profile" element={<Profilestaff />} />
                  <Route
                    path="/staff/mental"
                    element={<MentalHealthManagement />}
                  />
                  <Route
                    path="/staff/mental-assessments"
                    element={<MentalHealthManagement />}
                  />
                  <Route
                    path="/staff/treatment-tasks"
                    element={<TreatmentTasks />}
                  />
                  {/* Elder routes */}
                  <Route path="/elder/dashboard" element={<ElderDashboard />} />
                  <Route
                    path="/elder/health-reports"
                    element={<ElderHealthReports />}
                  />
                  <Route
                    path="/elder/appointments"
                    element={<ElderAppointments />}
                  />
                  <Route
                    path="/elder/medications"
                    element={<ElderMedications />}
                  />
                  <Route
                    path="/elder/mental-wellness"
                    element={<ElderMentalWellness />}
                  />
                  <Route path="/elder/emergency" element={<ElderEmergency />} />
                  <Route path="/elder/profile" element={<ElderProfile />} />
                  {/* Booking and Payment routes */}
                  <Route
                    path="/appointment-booking"
                    element={<AppointmentBooking />}
                  />
                  <Route
                    path="/appointment-payment"
                    element={<AppointmentPaymentForm />}
                  />
                  {/* Doctor Calendar Modal - Uncomment if needed as a route */}
                  {/* <Route path="/doctor-calendar" element={<DoctorCalendarModal />} /> */}
                </Routes>

                {/* Toast notifications */}
                <Toaster
                  position="top-right"
                  reverseOrder={false}
                  gutter={8}
                  containerClassName=""
                  containerStyle={{}}
                  toastOptions={{
                    className: "",
                    duration: 4000,
                    style: {
                      background: "#363636",
                      color: "#fff",
                    },
                    success: {
                      duration: 3000,
                      theme: {
                        primary: "green",
                        secondary: "black",
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
