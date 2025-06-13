// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              
              {/* Protected Routes for Family Members */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['family_member']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['family_member']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute allowedRoles={['family_member']}>
                    <Settings />
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

              {/* Doctor Routes */}
              <Route 
                path="/doctor/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
                      <p className="text-gray-600 mt-2">Patient management portal</p>
                    </div>
                  </ProtectedRoute>
                } 
              />

              {/* Staff Routes */}
              <Route 
                path="/staff/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold">Staff Dashboard</h1>
                      <p className="text-gray-600 mt-2">Care management portal</p>
                    </div>
                  </ProtectedRoute>
                } 
              />

              {/* Pharmacist Routes */}
              <Route 
                path="/pharmacy/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['pharmacist']}>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold">Pharmacy Dashboard</h1>
                      <p className="text-gray-600 mt-2">Medication management portal</p>
                    </div>
                  </ProtectedRoute>
                } 
              />

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