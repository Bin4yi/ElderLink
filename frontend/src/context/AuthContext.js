// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Set the token in the API header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Try to get the user profile
        const response = await authService.getProfile();
        setUser(response.user);
        console.log('Auth check successful:', response.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Attempting login with', credentials.email);
      
      const response = await authService.login(credentials);
      console.log('AuthContext: Login response:', response);
      
      const { user, token } = response;
      
      if (!user || !token) {
        throw new Error('Invalid response from server');
      }
      
      // Store token and set API header
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user state
      setUser(user);
      
      console.log('AuthContext: Login successful for user:', user);
      toast.success(`Welcome back, ${user.firstName}!`);
      
      // Return the response so Login component can access user role
      return response;
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      
      // Clear any existing auth data
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      
      // Show error toast
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext: Attempting registration');
      
      const response = await authService.register(userData);
      const { user, token } = response;
      
      // Store token and set API header
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user state
      setUser(user);
      
      console.log('AuthContext: Registration successful for user:', user);
      toast.success(`Welcome to ElderLink, ${user.firstName}!`);
      
      return response;
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      
      // Show error toast
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      
      throw error;
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    
    // Clear all auth data
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    
    toast.success('Logged out successfully');
    
    // Redirect to home page
    window.location.href = '/';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};