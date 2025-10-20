import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit,
  Camera,
  Star,
  Heart,
  Home,
  Briefcase,
  Clock,
  Globe,
  Save,
  Loader
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';
import axios from 'axios';

const FamilyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/profile/family', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/profile/family',
        {
          phone: profile.phone,
          profileImage: profile.profileImage
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setProfile(response.data.data);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RoleLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </RoleLayout>
    );
  }

  if (!profile) {
    return (
      <RoleLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Failed to load profile'}</p>
            <button 
              onClick={fetchProfile}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30">
                  {profile.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white/70" />
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 bg-white text-red-600 rounded-full p-2 shadow-lg hover:scale-105 transition-transform">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {profile.firstName} {profile.lastName}
                </h1>
                <div className="flex items-center space-x-4 text-red-100">
                  <span className="flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    {profile.relationship}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Member since {new Date(profile.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-white hover:bg-white/90 text-red-600 rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105"
              >
                <Edit className="w-5 h-5 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 text-center">
            <Users className="w-8 h-8 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-900">{profile.connectedElders.length}</div>
            <div className="text-red-600 text-sm">Connected Elders</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 text-center">
            <Shield className="w-8 h-8 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-900">Active</div>
            <div className="text-red-600 text-sm">Account Status</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 text-center">
            <Star className="w-8 h-8 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-900">Premium</div>
            <div className="text-red-600 text-sm">Membership Level</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 text-center">
            <Clock className="w-8 h-8 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-900">
              {Math.floor((new Date() - new Date(profile.joinedDate)) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-red-600 text-sm">Days Active</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <User className="w-6 h-6 mr-3 text-red-600" />
                Personal Information
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Mail className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-semibold text-gray-900">Email Address</span>
                </div>
                <p className="text-gray-700 ml-7">{profile.email}</p>
                {isEditing && (
                  <p className="text-xs text-gray-500 ml-7 mt-1">Email cannot be changed</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Phone className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-semibold text-gray-900">Phone Number</span>
                </div>
                {isEditing ? (
                  <input 
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                ) : (
                  <p className="text-gray-700 ml-7">{profile.phone}</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <User className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-semibold text-gray-900">Full Name</span>
                </div>
                <p className="text-gray-700 ml-7">{profile.firstName} {profile.lastName}</p>
                {isEditing && (
                  <p className="text-xs text-gray-500 ml-7 mt-1">Name cannot be changed</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-semibold text-gray-900">Member Since</span>
                </div>
                <p className="text-gray-700 ml-7">
                  {new Date(profile.joinedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-red-600" />
                Account Information
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-semibold text-gray-900">Account Status</span>
                </div>
                <p className="text-gray-700 ml-7">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <User className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-semibold text-gray-900">User Role</span>
                </div>
                <p className="text-gray-700 ml-7 capitalize">{profile.role.replace('_', ' ')}</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-semibold text-gray-900">Connected Elders</span>
                </div>
                <p className="text-gray-700 ml-7">{profile.connectedElders?.length || 0} Elder(s)</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Camera className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-semibold text-gray-900">Profile Image</span>
                </div>
                <p className="text-gray-700 ml-7 text-sm">
                  {profile.profileImage ? 'Uploaded' : 'No image uploaded'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Elders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-3 text-red-600" />
              Connected Elders
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.connectedElders.map((elder, index) => (
                <div key={index} className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{elder.name}</h4>
                        <p className="text-sm text-gray-600">{elder.relationship}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      elder.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {elder.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl p-6 border border-red-200">
          <h3 className="text-lg font-bold text-red-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
            <button 
              onClick={() => alert('Photo upload feature coming soon!')}
              className="bg-white hover:bg-gray-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Camera className="w-4 h-4 mr-2" />
              Update Photo
            </button>
            <button 
              onClick={() => window.location.href = '/family/subscription'}
              className="bg-white hover:bg-gray-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Subscriptions
            </button>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default FamilyProfile;