import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart, 
  Edit, 
  Shield, 
  Users 
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';

const FamilyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Dummy family member data
  const familyMember = {
    firstName: "Jessica",
    lastName: "Thompson",
    email: "jessica.thompson@elderlink.com",
    phone: "+1-555-STAFF01",
    address: "123 Maple Street, Springfield, IL 62701",
   
    relationship: "Primary Caregiver",
    joinedDate: "2024-01-15",
    connectedElders: 2
  };

  const [profile, setProfile] = useState(familyMember);

  return (
    <RoleLayout>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 via-pink-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              <div className="flex items-center space-x-4 text-pink-100">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Status */}
          <div className="bg-gradient-to-br from-pink-50 to-red-50 border border-pink-200 rounded-xl p-3 text-center">
            <Shield className="w-8 h-8 mx-auto text-pink-600 mb-2" />
            <div className="text-2xl font-bold text-pink-900">Active</div>
            <div className="text-pink-600 text-sm">Account Status</div>
          </div>

          {/* Connected Elders */}
          <div className="bg-gradient-to-br from-pink-50 to-red-50 border border-pink-200 rounded-xl p-3 text-center">
            <Users className="w-8 h-8 mx-auto text-pink-600 mb-2" />
            <div className="text-2xl font-bold text-pink-900">
              {profile.connectedElders}
            </div>
            <div className="text-pink-600 text-sm">Connected Elders</div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-50 to-red-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <User className="w-6 h-6 mr-3 text-pink-600" />
              Personal Information
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Email */}
            <div className="bg-gradient-to-br from-gray-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Mail className="w-5 h-5 mr-2 text-pink-600" />
                <span className="font-semibold text-gray-900">Email Address</span>
              </div>
              {isEditing ? (
                <input 
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              ) : (
                <p className="text-gray-700 ml-7">{profile.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="bg-gradient-to-br from-gray-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Phone className="w-5 h-5 mr-2 text-pink-600" />
                <span className="font-semibold text-gray-900">Phone Number</span>
              </div>
              {isEditing ? (
                <input 
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              ) : (
                <p className="text-gray-700 ml-7">{profile.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="bg-gradient-to-br from-gray-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 mr-2 text-pink-600" />
                <span className="font-semibold text-gray-900">Address</span>
              </div>
              {isEditing ? (
                <textarea 
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  rows="2"
                />
              ) : (
                <p className="text-gray-700 ml-7">{profile.address}</p>
              )}
            </div>

            {/* Date of Birth removed */}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default FamilyProfile;
