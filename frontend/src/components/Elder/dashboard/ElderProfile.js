import React, { useEffect, useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Heart, 
  Shield, 
  Pill,
  Edit,
  Mail,
  Clock,
  Activity,
  FileText,
  Camera
} from 'lucide-react';
import { elderService } from '../../../services/elder';

const ElderProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await elderService.getElderProfile();
        setProfile(response.elder);
      } catch (error) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <RoleLayout title="My Profile">
        <div className="flex items-center justify-center min-h-96">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-red-700 font-medium">Loading your profile...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  if (!profile) {
    return (
      <RoleLayout title="My Profile">
        <div className="flex items-center justify-center min-h-96">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
            <User className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Profile Not Found</h3>
            <p className="text-red-600">Unable to load your profile information.</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="My Profile">
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30">
                  {profile.photo ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/elders/${profile.photo}`}
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
                    <User className="w-4 h-4 mr-2" />
                    {profile.gender}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105">
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Phone className="w-6 h-6 mr-3 text-red-600" />
                Contact Information
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <MapPin className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-semibold text-gray-900">Address</span>
                </div>
                <p className="text-gray-700 ml-7">{profile.address || 'Not provided'}</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Phone className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-semibold text-gray-900">Phone Number</span>
                </div>
                <p className="text-gray-700 ml-7">{profile.phone || 'Not provided'}</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-semibold text-gray-900">Emergency Contact</span>
                </div>
                <p className="text-gray-700 ml-7">{profile.emergencyContact || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Heart className="w-6 h-6 mr-3 text-red-600" />
                Medical Information
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                  <div className="font-semibold text-gray-900 mb-1">Blood Type</div>
                  <div className="text-2xl font-bold text-red-600">{profile.bloodType || 'Unknown'}</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                  <div className="font-semibold text-gray-900 mb-1">Health Status</div>
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 mr-1 text-green-600" />
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="font-semibold text-gray-900 mb-2">Allergies</div>
                <p className="text-gray-700">{profile.allergies || 'None reported'}</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="font-semibold text-gray-900 mb-2">Chronic Conditions</div>
                <p className="text-gray-700">{profile.chronicConditions || 'None reported'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical History & Medications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-red-600" />
                Medical History
              </h3>
            </div>
            
            <div className="p-6">
              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <p className="text-gray-700">
                  {profile.medicalHistory || 'No medical history recorded'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Pill className="w-6 h-6 mr-3 text-red-600" />
                Current Medications
              </h3>
            </div>
            
            <div className="p-6">
              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <p className="text-gray-700">
                  {profile.currentMedications || 'No current medications recorded'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Healthcare Provider & Insurance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-red-600" />
              Healthcare Provider & Insurance
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-red-600" />
                  Primary Care Doctor
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{profile.doctorName || 'Not assigned'}</span>
                  </div>
                  {profile.doctorPhone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{profile.doctorPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-600" />
                  Insurance Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">Provider:</span>
                    <span className="ml-2 font-medium">{profile.insuranceProvider || 'Not provided'}</span>
                  </div>
                  {profile.insuranceNumber && (
                    <div>
                      <span className="text-gray-600">Policy #:</span>
                      <span className="ml-2 font-medium">#{profile.insuranceNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-red-600" />
              Subscription Information
            </h3>
          </div>
          
          <div className="p-6">
            {profile.subscription ? (
              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-gray-600 text-sm">Current Plan</div>
                    <div className="text-xl font-bold text-red-600 capitalize">
                      {profile.subscription.plan}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">Status</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      profile.subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        profile.subscription.status === 'active' ? 'bg-green-600' : 'bg-yellow-600'
                      }`}></div>
                      {profile.subscription.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">Valid Period</div>
                    <div className="text-sm font-medium text-gray-900">
                      {profile.subscription.startDate ? new Date(profile.subscription.startDate).toLocaleDateString() : 'N/A'} - {profile.subscription.endDate ? new Date(profile.subscription.endDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No subscription information available</p>
                <button className="mt-3 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Subscribe Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl p-6 border border-red-200">
          <h3 className="text-lg font-bold text-red-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
            <button className="bg-white hover:bg-gray-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
              <Camera className="w-4 h-4 mr-2" />
              Update Photo
            </button>
            <button className="bg-white hover:bg-gray-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Privacy Settings
            </button>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};


export default ElderProfile;