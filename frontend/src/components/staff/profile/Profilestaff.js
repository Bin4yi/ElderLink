import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  Shield, 
  Users,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';
import { getStaffProfile } from '../../../services/profileService';
import toast from 'react-hot-toast';

const StaffProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getStaffProfile();
      
      if (response.success) {
        setProfile(response.data);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RoleLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading your profile...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  if (!profile) {
    return (
      <RoleLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Failed to load profile</p>
            <button 
              onClick={loadProfile}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Header Card */}
        <div className="bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-4 ring-white/30">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-1">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <div className="flex items-center gap-2 text-blue-100">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium">{profile.specialization || 'Healthcare Staff'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-blue-50 text-sm">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(profile.joinedDate || profile.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <Users className="w-4 h-4" />
                  {profile.connectedElders || 0} Connected Elder{profile.connectedElders !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Account Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Connected Elders</p>
                <p className="text-2xl font-bold text-gray-900">{profile.connectedElders || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                <p className="text-gray-600 text-sm">Your profile details and contact information</p>
              </div>
            </div>
          </div>
          
          {/* Card Body */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Name Section */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Full Name</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      First Name
                    </label>
                    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-gray-900 font-semibold text-lg">
                        {profile.firstName}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Last Name
                    </label>
                    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-gray-900 font-semibold text-lg">
                        {profile.lastName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Contact Details</h4>
                </div>
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      Email Address
                    </label>
                    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-gray-900 font-medium">
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      Phone Number
                    </label>
                    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-gray-900 font-medium">
                        {profile.phone || (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 font-medium">Profile Information</p>
            <p className="text-blue-700 text-sm mt-1">
              This is your staff profile information. Contact your administrator if you need to update any details.
            </p>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default StaffProfile;
