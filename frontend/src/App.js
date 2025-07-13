// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Providers
import { AuthProvider } from "./context/AuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext"; // ADD THIS

// Components
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// Admin Components
import AdminDashboard from "./components/admin/dashboard/AdminDashboard";

// Doctor Components
import DoctorDashboard from "./components/doctor/dashboard/DoctorDashboard";

// Family Components
import FamilyDashboard from "./components/family/dashboard/FamilyDashboard";

// Pharmacy Components
import PharmacyDashboard from "./components/pharmacist/dashboard/PharmacyDashboard";

//Mental Health Consultant Components
import MentalHealthDashboard from "./components/mental-health/dashboard/MentalHealthDashboard";
import MentalHealthProfile from "./components/mental-health/profile/profile";
import MentalHealthClients from "./components/mental-health/pations/clients";
import ProgressReport from "./components/mental-health/p-reports/p-report";
import TreatmentPlans from "./components/mental-health/t-plans/t-plans";
import MentalHealthAssessments from "./components/mental-health/assessments/assessments";
import MentalHealthResources from "./components/mental-health/m-resources/resources";
import MentalHealthTherapySessions from "./components/mental-health/sessions/sessions";
// Staff Components
import StaffDashboard from "./components/staff/dashboard/StaffDashboard";
import PatientManagement from "./components/staff/care-management/PatientManagement";
import AlertManagement from "./components/staff/monitoring/AlertsManagement";
import HealthMonitoring from "./components/staff/alerts/HealthMonitoring";
import Report from "./components/staff/reports/Report";
import Profilestaff from "./components/staff/profile/Profilestaff";
import CareManagement from "./components/staff/care-management/PatientManagement";
// Elder Components
import ElderDashboard from "./components/Elder/dashboard/Elder";

function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          {" "}
          {/* ADD THIS WRAPPER */}
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
              <Route
                path="/pharmacy/dashboard"
                element={<PharmacyDashboard />}
              />
              <Route
                path="/mental-health/dashboard"
                element={<MentalHealthDashboard />}
              />
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route
                path="/staff/care-management"
                element={<PatientManagement />}
              />
              <Route path="/staff/monitoring" element={<AlertManagement />} />
              <Route path="/staff/alerts" element={<HealthMonitoring />} />
              <Route path="/staff/reports" element={<Report />} />
              <Route path="/staff/profile" element={<Profilestaff />} />

              {/* NEW: Elder routes */}
              <Route path="/elder/dashboard" element={<ElderDashboard />} />

              {/* Staff routes */}
              <Route path="/staff/care" element={<CareManagement />} />

              {/* Mental Health Profile Route */}
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
        </SubscriptionProvider>{" "}
        {/* CLOSE THE WRAPPER */}
      </AuthProvider>
    </Router>
  );
}

export default App;
