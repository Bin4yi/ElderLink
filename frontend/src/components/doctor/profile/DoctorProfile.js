// src/components/doctor/profile/DoctorProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Briefcase, Award, GraduationCap, 
  MapPin, Calendar, Clock, DollarSign, Edit2, Save, X,
  CheckCircle, AlertCircle, Stethoscope, Users, FileText,
  Star, TrendingUp, Activity, CalendarCheck, Lock, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import api from '../../../services/api';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('profile'); // New state for tabs
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  
  // Password change modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchChartData();
    }
  }, [activeTab]);

  const fetchChartData = async () => {
    setChartLoading(true);
    try {
      const response = await api.get('/api/doctor/profile/revenue-chart?days=30');
      // Format data for chart
      const formattedData = response.data.data.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: parseFloat(item.revenue || 0),
        appointments: parseInt(item.appointments || 0)
      }));
      setChartData(formattedData);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      toast.error('Failed to load chart data');
    } finally {
      setChartLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading doctor profile...');
      
      const response = await api.get('/doctor/profile');
      console.log('✅ Profile loaded:', response.data);
      
      if (response.data.success) {
        setProfile(response.data.data);
        setFormData(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/doctor/profile/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setFormData(profile);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(profile);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (name, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [name]: array
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving profile changes...');
      
      const response = await api.put('/doctor/profile', formData);
      console.log('✅ Profile saved:', response.data);
      
      if (response.data.success) {
        setProfile(response.data.data);
        setFormData(response.data.data);
        setEditing(false);
        toast.success('Profile updated successfully!');
        loadStats(); // Reload stats
      } else {
        toast.error(response.data.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Password change functions
  const handlePasswordModalOpen = () => {
    setShowPasswordModal(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      setChangingPassword(true);
      
      const response = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        handlePasswordModalClose();
      } else {
        toast.error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('❌ Error changing password:', error);
      if (error.response?.status === 401) {
        toast.error('Current password is incorrect');
      } else {
        toast.error(error.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <RoleLayout title="Doctor Profile">
        <Loading text="Loading your profile..." />
      </RoleLayout>
    );
  }

  if (!profile) {
    return (
      <RoleLayout title="Doctor Profile">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
            <p className="text-gray-600">Unable to load your doctor profile.</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Verified
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending Verification
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <RoleLayout title="Doctor Profile">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl shadow-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-white ring-opacity-50">
                {profile.profileImage ? (
                  <img 
                    src={profile.profileImage} 
                    alt={`Dr. ${profile.firstName} ${profile.lastName}`}
                    className="w-28 h-28 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-14 h-14 text-blue-600" />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-3">
                  Dr. {profile.firstName} {profile.lastName}
                </h1>
                
                {/* Specialization Badge */}
                <div className="mb-3">
                  <span className="inline-flex items-center px-4 py-2 rounded-lg text-lg font-semibold bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-lg">
                    <Stethoscope className="w-5 h-5 mr-2" />
                    {profile.specialization}
                  </span>
                </div>

                

                <div className="flex items-center space-x-4">
                  {getVerificationBadge(profile.verificationStatus)}
                  <span className="text-base text-white/80 font-medium">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Member since {new Date(profile.memberSince).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
            
            {activeTab === 'profile' && (
              <>
                {!editing ? (
                  <button
                    onClick={handleEdit}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
                  >
                    <Edit2 className="w-5 h-5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profile Details</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('analytics');
                setEditing(false); // Disable editing when switching to analytics
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Profile Details Tab */}
        {activeTab === 'profile' && (
          <>
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Patients Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-2">Total Patients</p>
                  <p className="text-4xl font-bold text-white mb-1">{stats.totalPatients}</p>
                  <p className="text-blue-200 text-xs">Active patients</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Total Appointments Card */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-2">Total Appointments</p>
                  <p className="text-4xl font-bold text-white mb-1">{stats.totalAppointments}</p>
                  <p className="text-green-200 text-xs">All time</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Completed Appointments Card */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-2">Completed</p>
                  <p className="text-4xl font-bold text-white mb-1">{stats.completedAppointments}</p>
                  <p className="text-purple-200 text-xs">
                    {stats.totalAppointments > 0 
                      ? `${Math.round((stats.completedAppointments / stats.totalAppointments) * 100)}% success rate`
                      : 'No appointments yet'}
                  </p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Experience Card */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium mb-2">Experience</p>
                  <p className="text-4xl font-bold text-white mb-1">{stats.yearsOfExperience}</p>
                  <p className="text-amber-200 text-xs">Years of practice</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
              <User className="w-7 h-7 mr-2 text-blue-600" />
              <span className="text-2xl">Personal Information</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name Display */}
              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="flex items-center text-xl font-bold text-gray-800">
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  Dr. {profile.firstName} {profile.lastName}
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Email Address
                </label>
                <p className="text-gray-600 text-base">{profile.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800 font-medium text-lg">{profile.phone || 'Not provided'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Professional Bio
                </label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell patients about yourself and your practice..."
                  />
                ) : (
                  <p className="text-gray-800 text-base leading-relaxed">{profile.bio || 'No bio provided'}</p>
                )}
              </div>

              {/* Change Password Button */}
              <div className="md:col-span-2 pt-4 border-t">
                <button
                  onClick={handlePasswordModalOpen}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Lock className="w-5 h-5" />
                  <span>Change Password</span>
                </button>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
              <Stethoscope className="w-7 h-7 mr-2 text-blue-600" />
              <span className="text-2xl">Professional Details</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  Specialization
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="inline-flex items-center px-4 py-2 rounded-lg text-base font-semibold bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    {profile.specialization}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-1" />
                  License Number
                </label>
                <p className="text-gray-600 text-base font-mono bg-gray-100 px-3 py-2 rounded-lg inline-block">{profile.licenseNumber}</p>
                <p className="text-xs text-gray-500 mt-1">License cannot be changed</p>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Experience
                </label>
                {editing ? (
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience || ''}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800 font-medium text-lg">{profile.experience} Years</p>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Consultation Fee
                </label>
                {editing ? (
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="inline-flex items-center px-4 py-2 rounded-lg text-base font-semibold bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md">
                    <DollarSign className="w-4 h-4 mr-2" />
                    ${profile.consultationFee} 
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Medical School
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="medicalSchool"
                    value={formData.medicalSchool || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800 text-base">{profile.medicalSchool || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Availability & Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Availability */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6 border-b pb-3">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Calendar className="w-7 h-7 mr-2 text-blue-600" />
                <span className="text-2xl">Availability</span>
              </h2>
              <button
                onClick={() => navigate('/doctor/schedule')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <CalendarCheck className="w-5 h-5" />
                <span>Manage Availability</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.availableDays?.map((day, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {day}
                    </span>
                  ))}
                  {(!profile.availableDays || profile.availableDays.length === 0) && (
                    <p className="text-gray-500 text-sm">No available days set. Click "Manage Schedule" to configure.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slots
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.timeSlots?.map((slot, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {slot}
                    </span>
                  ))}
                  {(!profile.timeSlots || profile.timeSlots.length === 0) && (
                    <p className="text-gray-500 text-sm">No time slots set. Click "Manage Schedule" to configure.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
              <MapPin className="w-7 h-7 mr-2 text-blue-600" />
              <span className="text-2xl">Clinic Location</span>
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinic Address
              </label>
              {editing ? (
                <textarea
                  name="clinicAddress"
                  value={formData.clinicAddress || ''}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your clinic address..."
                />
              ) : (
                <p className="text-gray-800 whitespace-pre-line">
                  {profile.clinicAddress || 'Clinic address not provided'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
            <Activity className="w-7 h-7 mr-2 text-blue-600" />
            <span className="text-2xl">Account Status</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Status
              </label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                profile.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Status
              </label>
              {getVerificationBadge(profile.verificationStatus)}
            </div>

            {profile.verifiedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verified On
                </label>
                <p className="text-gray-800">
                  {new Date(profile.verifiedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Revenue Analytics</h2>
            
            {stats ? (
              <>
                {/* Revenue Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Total Revenue */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-emerald-700">
                      ${parseFloat(stats.totalRevenue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      From all confirmed appointments (90% share)
                    </p>
                  </div>

                  {/* Earned Revenue */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-400">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Earned Revenue</p>
                    <p className="text-3xl font-bold text-green-700">
                      ${parseFloat(stats.earnedRevenue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      From completed appointments (90% share)
                    </p>
                  </div>

                  {/* Monthly Revenue */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-8 h-8 text-teal-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">This Month</p>
                    <p className="text-3xl font-bold text-teal-700">
                      ${parseFloat(stats.monthlyRevenue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Expected revenue this month (90% share)
                    </p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {stats.totalAppointments || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Average Consultation Fee</p>
                      <p className="text-2xl font-bold text-gray-800">
                        ${parseFloat(stats.averageConsultationFee || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Monthly Earned</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${parseFloat(stats.monthlyEarned || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Monthly Pending</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ${(parseFloat(stats.monthlyRevenue || 0) - parseFloat(stats.monthlyEarned || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="mt-8 bg-gray-50 rounded-xl p-8 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-emerald-600" />
                    30-Day Revenue Trend (90% Share)
                  </h3>
                  {chartLoading ? (
                    <div className="flex items-center justify-center h-80">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading chart data...</p>
                      </div>
                    </div>
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart 
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12, fill: '#666' }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#666' }}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'revenue') return [`$${parseFloat(value).toLocaleString()}`, 'Revenue (90%)'];
                            return [value, 'Appointments'];
                          }}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '10px'
                          }}
                          labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          formatter={(value) => value === 'revenue' ? 'Revenue (90% Share)' : 'Appointments'}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 7, strokeWidth: 2 }}
                          name="revenue"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-80 text-gray-500">
                      <div className="text-center">
                        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No revenue data available</p>
                        <p className="text-sm mt-2">Revenue data will appear here once you have appointments</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading analytics...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Change Password</h2>
                </div>
                <button
                  onClick={handlePasswordModalClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                  disabled={changingPassword}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-blue-100 mt-2 text-sm">
                Enter your current password and choose a new secure password
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your current password"
                    disabled={changingPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={changingPassword}
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You must verify your current password to make changes
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your new password"
                    disabled={changingPassword}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={changingPassword}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 characters required
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your new password"
                    disabled={changingPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={changingPassword}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordData.newPassword && passwordData.confirmPassword && 
                 passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Security Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Password Security Tips
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Use at least 6 characters</li>
                  <li>• Mix uppercase and lowercase letters</li>
                  <li>• Include numbers and special characters</li>
                  <li>• Avoid common words or personal information</li>
                </ul>
              </div>

              {/* Modal Footer */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handlePasswordModalClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  disabled={changingPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RoleLayout>
  );
};

export default DoctorProfile;
