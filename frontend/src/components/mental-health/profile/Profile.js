// File: frontend/src/components/mental-health/profile/profile.js
import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';

const mockProfile = {
  name: 'Dr. Jane Smith',
  email: 'mental.specialist@elderlink.com',
  phone: '+1 555-123-4567',
  specialization: 'Clinical Psychologist',
  licenseNumber: 'MH-2024-001',
  bio: 'Passionate about supporting elder mental health and well-being. 10+ years of experience in clinical psychology and therapy.',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
};

const Profile = () => {
  const [profile] = useState(mockProfile);

  return (
    <RoleLayout title="Profile">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto">
        <div className="flex items-center mb-6">
          <img
            src={profile.avatar}
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-blue-200 object-cover mr-6"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-blue-600 font-medium">{profile.specialization}</p>
            <p className="text-xs text-gray-500">License: {profile.licenseNumber}</p>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <div className="bg-gray-50 px-4 py-2 rounded text-gray-700">{profile.email}</div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
          <div className="bg-gray-50 px-4 py-2 rounded text-gray-700">{profile.phone}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
          <div className="bg-gray-50 px-4 py-2 rounded text-gray-700">{profile.bio}</div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default Profile;