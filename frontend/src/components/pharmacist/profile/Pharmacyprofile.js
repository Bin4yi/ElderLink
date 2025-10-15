import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import {
  User, Mail, Phone, MapPin, Building, Calendar, Edit2, Save, X, 
  Eye, Shield, Bell, Settings, Activity, Award, Clock, 
  CheckCircle, TrendingUp, FileText, Camera
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [profileData, setProfileData] = useState({
    firstName: 'Dr. Kevin',
    lastName: 'Lee',
    email: 'kevin.lee@elderlink.com',
    phone: '+94 77 123 4567',
    role: 'Pharmacist',
    department: 'Pharmacy Department',
    location: 'Colombo General Hospital',
    joinDate: '2023-01-15',
    employeeId: 'EMP-2024-001',
    licenseNumber: 'PH-LK-2021-0456',
    specialization: 'Clinical Pharmacy',
    yearsExperience: '5',
    bio: 'Experienced pharmacist specializing in medication management and patient care with a focus on geriatric pharmacy.'
  });

  const [tempData, setTempData] = useState(profileData);
  const [activityStats] = useState({
    itemsManaged: 1247,
    reportsGenerated: 89,
    prescriptionsProcessed: 2156,
    patientsServed: 892,
    lastLoginTime: 'Today, 9:30 AM',
    totalLogins: 145
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(profileData);
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProfileData(tempData);
      setIsEditing(false);
      setLoading(false);
      showNotification('Profile updated successfully');
    }, 1000);
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

      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {profileData.firstName[0]}{profileData.lastName[0]}
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
                <div className="flex items-center space-x-1 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Active Status</span>
                </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Activity}
            title="Items Managed"
            value={activityStats.itemsManaged}
            subtitle="This month"
            color="blue"
          />
          <StatCard
            icon={FileText}
            title="Reports Generated"
            value={activityStats.reportsGenerated}
            subtitle="This quarter"
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            title="Prescriptions"
            value={activityStats.prescriptionsProcessed}
            subtitle="Total processed"
            color="purple"
          />
          <StatCard
            icon={User}
            title="Patients Served"
            value={activityStats.patientsServed}
            subtitle="This year"
            color="orange"
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
                    value={tempData.firstName}
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
                    value={tempData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{profileData.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg flex-1">{profileData.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg flex-1">{profileData.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <select
                      value={tempData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option>Pharmacist</option>
                      <option>Senior Pharmacist</option>
                      <option>Clinical Pharmacist</option>
                      <option>Pharmacy Manager</option>
                      <option>Hospital Pharmacist</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg flex-1">{profileData.role}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg flex-1">{profileData.department}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg flex-1">{profileData.location}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
                {isEditing ? (
                  <textarea
                    value={tempData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Tell us about your professional background and expertise..."
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{profileData.bio}</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <p className="text-gray-900 bg-green-50 px-3 py-2 rounded-lg font-mono text-sm">{profileData.licenseNumber}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <p className="text-gray-900 bg-purple-50 px-3 py-2 rounded-lg">{profileData.specialization}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-orange-500" />
                    <p className="text-gray-900">{profileData.yearsExperience} years</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <p className="text-gray-900">{new Date(profileData.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Account Settings</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors">
                  <Eye className="w-5 h-5" />
                  <span>Privacy Settings</span>
                </button>

                <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors">
                  <FileText className="w-5 h-5" />
                  <span>Download Reports</span>
                </button>
              </div>
            </div>

            {/* Login Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{activityStats.lastLoginTime}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Logins</span>
                  <span className="font-medium text-blue-600">{activityStats.totalLogins}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profile Completed</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-4/5 transition-all duration-500"></div>
                    </div>
                    <span className="text-sm font-medium text-green-600">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default ProfilePage;