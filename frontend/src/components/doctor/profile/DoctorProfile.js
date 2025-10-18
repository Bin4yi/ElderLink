// src/components/doctor/profile/DoctorProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Briefcase, Award, GraduationCap, 
  MapPin, Calendar, Clock, DollarSign, Edit2, Save, X,
  CheckCircle, AlertCircle, Stethoscope, Users, FileText,
  Star, TrendingUp, Activity, CalendarCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

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
          </div>
        </div>

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
      </div>
    </RoleLayout>
  );
};

export default DoctorProfile;
