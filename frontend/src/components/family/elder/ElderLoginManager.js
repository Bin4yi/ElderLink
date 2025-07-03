import React, { useState } from 'react';
import { Key, Shield, User, Eye, EyeOff } from 'lucide-react';
import { elderService } from '../../../services/elder';
import toast from 'react-hot-toast';

const ElderLoginManager = ({ elder, onUpdate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '' // FIXED: Add confirmPassword field
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // FIXED: Add separate state
  const [loading, setLoading] = useState(false);

  const handleCreateLogin = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password || !credentials.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    // FIXED: Check password match
    if (credentials.password !== credentials.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // FIXED: Check minimum password length
    if (credentials.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // FIXED: Only send username and password to API
      const response = await elderService.createElderLogin(elder.id, {
        username: credentials.username,
        password: credentials.password
      });
      
      toast.success('Login credentials created successfully!');
      setShowCreateForm(false);
      setCredentials({ username: '', password: '', confirmPassword: '' }); // FIXED: Reset all fields
      onUpdate(response.elder);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create login';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccess = async (hasAccess) => {
    setLoading(true);
    try {
      const response = await elderService.toggleElderAccess(elder.id, hasAccess);
      toast.success(`Elder access ${hasAccess ? 'enabled' : 'disabled'}`);
      onUpdate(response.elder);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update access';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Handle form field changes properly
  const handleCredentialChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Key className="w-5 h-5 mr-2 text-blue-500" />
        Login Access Management
      </h3>

      {!elder.hasLoginAccess ? (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Shield className="w-5 h-5 mr-2 text-gray-500" />
              <span className="font-medium text-gray-700">No Login Access</span>
            </div>
            <p className="text-gray-600 text-sm">
              {elder.firstName} doesn't have login credentials yet.
            </p>
          </div>

          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Login Credentials
            </button>
          ) : (
            <form onSubmit={handleCreateLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username/Email
                </label>
                <input
                  type="email"
                  value={credentials.username}
                  onChange={(e) => handleCredentialChange('username', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="elder@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => handleCredentialChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Create a secure password"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters long
                </p>
              </div>

              {/* FIXED: Add confirm password field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={credentials.confirmPassword}
                    onChange={(e) => handleCredentialChange('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                      credentials.confirmPassword && credentials.password !== credentials.confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Confirm the password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* FIXED: Show password mismatch error */}
                {credentials.confirmPassword && credentials.password !== credentials.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">
                    Passwords do not match
                  </p>
                )}
                {credentials.confirmPassword && credentials.password === credentials.confirmPassword && credentials.password && (
                  <p className="text-xs text-green-600 mt-1">
                    Passwords match ✓
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading || (credentials.password !== credentials.confirmPassword) || !credentials.password || !credentials.confirmPassword}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Login'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCredentials({ username: '', password: '', confirmPassword: '' }); // FIXED: Reset all fields
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-green-500" />
                <span className="font-medium text-green-700">Login Access Active</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                elder.user?.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {elder.user?.isActive ? 'Active' : 'Disabled'}
              </div>
            </div>
            <p className="text-green-600 text-sm mb-2">
              Username: {elder.username}
            </p>
            <p className="text-green-600 text-sm">
              {elder.firstName} can now log in to their dashboard.
            </p>
          </div>

          <div className="flex space-x-3">
            {elder.user?.isActive ? (
              <button
                onClick={() => handleToggleAccess(false)}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Disabling...' : 'Disable Access'}
              </button>
            ) : (
              <button
                onClick={() => handleToggleAccess(true)}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enabling...' : 'Enable Access'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ElderLoginManager;