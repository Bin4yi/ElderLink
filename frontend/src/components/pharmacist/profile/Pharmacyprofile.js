import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoleLayout from '../../common/RoleLayout';
import {
  User, Mail, Phone, MapPin, Building, Calendar, Edit2, Save, X, 
  Shield, Activity, TrendingUp, FileText, Camera
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Pharmacist',
    department: 'Pharmacy Department',
    location: 'Main Hospital',
    joinDate: '',
    employeeId: '',
    licenseNumber: '',
    specialization: 'Clinical Pharmacy',
    yearsExperience: '',
    bio: ''
  });

  const [tempData, setTempData] = useState({});
  const [activityStats, setActivityStats] = useState({
    totalPrescriptions: 0,
    prescriptionsThisMonth: 0,
    deliveriesThisMonth: 0
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/profile/pharmacist`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const data = response.data.data;
        
        // Format the date
        const joinDate = data.joinDate ? new Date(data.joinDate).toISOString().split('T')[0] : '';
        
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'Pharmacist',
          department: data.department || 'Pharmacy Department',
          location: data.location || 'Main Hospital',
          joinDate: joinDate,
          employeeId: `EMP-${data.id || '000'}`,
          licenseNumber: data.licenseNumber || '',
          specialization: data.specialization || 'Clinical Pharmacy',
          yearsExperience: '',
          bio: data.bio || ''
        });

        setActivityStats({
          totalPrescriptions: data.stats?.totalPrescriptions || 0,
          prescriptionsThisMonth: data.stats?.prescriptionsThisMonth || 0,
          deliveriesThisMonth: data.stats?.deliveriesThisMonth || 0
        });

        setTempData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          specialization: data.specialization || '',
          licenseNumber: data.licenseNumber || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(profileData);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${API_BASE_URL}/profile/pharmacist`,
        {
          firstName: tempData.firstName,
          lastName: tempData.lastName,
          phone: tempData.phone,
          specialization: tempData.specialization,
          licenseNumber: tempData.licenseNumber
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        
        // Format the date
        const joinDate = data.joinDate ? new Date(data.joinDate).toISOString().split('T')[0] : '';
        
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'Pharmacist',
          department: data.department || 'Pharmacy Department',
          location: data.location || 'Main Hospital',
          joinDate: joinDate,
          employeeId: `EMP-${data.id || '000'}`,
          licenseNumber: data.licenseNumber || '',
          specialization: data.specialization || 'Clinical Pharmacy',
          yearsExperience: '',
          bio: data.bio || ''
        });

        setActivityStats({
          totalPrescriptions: data.stats?.totalPrescriptions || 0,
          prescriptionsThisMonth: data.stats?.prescriptionsThisMonth || 0,
          deliveriesThisMonth: data.stats?.deliveriesThisMonth || 0
        });

        setIsEditing(false);
        showNotification('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempData(prev => ({ ...prev, [field]: value }));
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${
          color === 'blue' ? 'bg-blue-100' :
          color === 'green' ? 'bg-green-100' :
          color === 'purple' ? 'bg-purple-100' :
          color === 'orange' ? 'bg-orange-100' : 'bg-blue-100'
        } mr-4`}>
          <Icon className={`h-6 w-6 ${
            color === 'blue' ? 'text-blue-600' :
            color === 'green' ? 'text-green-600' :
            color === 'purple' ? 'text-purple-600' :
            color === 'orange' ? 'text-orange-600' : 'text-blue-600'
          }`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <RoleLayout title="Profile">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform ${
          notification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        } ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {loading && !profileData.firstName ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      ) : (
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {profileData.firstName && profileData.lastName 
                    ? `${profileData.firstName[0]}${profileData.lastName[0]}` 
                    : 'P'}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {profileData.role}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{profileData.department}</span>
                </div>
                <p className="text-gray-600 mt-1">{profileData.location}</p>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={TrendingUp}
            title="Total Prescriptions"
            value={activityStats.totalPrescriptions}
            subtitle="All time"
            color="blue"
          />
          <StatCard
            icon={Activity}
            title="This Month"
            value={activityStats.prescriptionsThisMonth}
            subtitle="Prescriptions filled"
            color="green"
          />
          <StatCard
            icon={FileText}
            title="Deliveries"
            value={activityStats.deliveriesThisMonth}
            subtitle="This month"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{profileData.firstName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{profileData.lastName}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-900 bg-gray-100 px-4 py-2 rounded-lg flex-1 cursor-not-allowed">{profileData.email}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="+1 (555) 000-0000"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg flex-1">{profileData.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.specialization || ''}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Clinical Pharmacy, Geriatric Pharmacy"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{profileData.specialization}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.licenseNumber || ''}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your license number"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg font-mono">{profileData.licenseNumber || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Account Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <p className="text-gray-900 bg-blue-50 px-3 py-2 rounded-lg font-mono text-sm">{profileData.employeeId}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <p className="text-gray-900 bg-blue-50 px-3 py-2 rounded-lg flex-1">{profileData.role}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-purple-500" />
                    <p className="text-gray-900 bg-purple-50 px-3 py-2 rounded-lg flex-1">{profileData.department}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <p className="text-gray-900 bg-green-50 px-3 py-2 rounded-lg flex-1">{profileData.location}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <p className="text-gray-900 bg-orange-50 px-3 py-2 rounded-lg flex-1">
                      {profileData.joinDate ? new Date(profileData.joinDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </RoleLayout>
  );
};

export default ProfilePage;