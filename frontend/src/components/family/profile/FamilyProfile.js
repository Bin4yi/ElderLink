import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';

const FamilyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Dummy family member data
  const familyMember = {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Maple Street, Springfield, IL 62701",
    dateOfBirth: "1985-06-15",
    relationship: "Primary Caregiver",
    occupation: "Registered Nurse",
    emergencyContact: "Robert Johnson - +1 (555) 987-6543",
    joinedDate: "2024-01-15",
    profilePhoto: null,
    preferences: {
      notifications: "All",
      language: "English",
      timezone: "EST"
    },
    connectedElders: [
      { name: "Margaret Johnson", relationship: "Mother", status: "Active" },
      { name: "Robert Johnson Sr.", relationship: "Father", status: "Active" }
    ]
  };

  const [profile, setProfile] = useState(familyMember);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
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
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105"
          >
            <Edit className="w-5 h-5 mr-2" />
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
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
              {isEditing ? (
                <input 
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              ) : (
                <p className="text-gray-700 ml-7">{profile.email}</p>
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
                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                <span className="font-semibold text-gray-900">Address</span>
              </div>
              {isEditing ? (
                <textarea 
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows="2"
                />
              ) : (
                <p className="text-gray-700 ml-7">{profile.address}</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 mr-2 text-red-600" />
                <span className="font-semibold text-gray-900">Date of Birth</span>
              </div>
              <p className="text-gray-700 ml-7">
                {new Date(profile.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Briefcase className="w-6 h-6 mr-3 text-red-600" />
              Professional & Emergency Info
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Briefcase className="w-5 h-5 mr-2 text-red-600" />
                <span className="font-semibold text-gray-900">Occupation</span>
              </div>
              {isEditing ? (
                <input 
                  type="text"
                  value={profile.occupation}
                  onChange={(e) => setProfile(prev => ({ ...prev, occupation: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              ) : (
                <p className="text-gray-700 ml-7">{profile.occupation}</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Heart className="w-5 h-5 mr-2 text-red-600" />
                <span className="font-semibold text-gray-900">Relationship</span>
              </div>
              <p className="text-gray-700 ml-7">{profile.relationship}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                <span className="font-semibold text-gray-900">Emergency Contact</span>
              </div>
              {isEditing ? (
                <input 
                  type="text"
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              ) : (
                <p className="text-gray-700 ml-7">{profile.emergencyContact}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="font-semibold text-gray-900 mb-1">Language</div>
                <div className="text-gray-700">{profile.preferences.language}</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4">
                <div className="font-semibold text-gray-900 mb-1">Timezone</div>
                <div className="text-gray-700">{profile.preferences.timezone}</div>
              </div>
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

      {/* Account Preferences */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Globe className="w-6 h-6 mr-3 text-red-600" />
            Account Preferences
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-6 text-center">
              <div className="font-semibold text-gray-900 mb-2">Notifications</div>
              <div className="text-red-600 text-lg font-bold">{profile.preferences.notifications}</div>
              <div className="text-sm text-gray-600 mt-1">Preference Level</div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-6 text-center">
              <div className="font-semibold text-gray-900 mb-2">Privacy Level</div>
              <div className="text-red-600 text-lg font-bold">Standard</div>
              <div className="text-sm text-gray-600 mt-1">Security Setting</div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-6 text-center">
              <div className="font-semibold text-gray-900 mb-2">Data Sharing</div>
              <div className="text-red-600 text-lg font-bold">Enabled</div>
              <div className="text-sm text-gray-600 mt-1">For Better Care</div>
            </div>
          </div>
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
          <button className="bg-white hover:bg-gray-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Manage Elders
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyProfile;