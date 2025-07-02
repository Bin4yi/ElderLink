// src/components/auth/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading text="Verifying access..." />;
  }

  if (!user) {
    // If no user, redirect to appropriate login page
    // If trying to access admin/staff routes, redirect to staff portal
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/admin') || 
        currentPath.startsWith('/doctor') || 
        currentPath.startsWith('/staff') || 
        currentPath.startsWith('/pharmacy')) {
      return <Navigate to="/staff" replace />;
    }
    // Otherwise redirect to main landing page
    return <Navigate to="/" replace />;
  }

  // Check if user's role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user's actual role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'doctor':
        return <Navigate to="/doctor/dashboard" replace />;
      case 'staff':
        return <Navigate to="/staff/dashboard" replace />;
      case 'pharmacist':
        return <Navigate to="/pharmacy/dashboard" replace />;
      case 'family_member':
        return <Navigate to="/family/dashboard" replace />;
      case 'elder':
        return <Navigate to="/elder/dashboard" replace />;
      break;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;