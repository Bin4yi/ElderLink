// src/components/staff/monitoring/AlertsManagement.js
import React, { useState} from 'react';
import RoleLayout from '../../common/RoleLayout';

const Profilestaff = () => {
 const [formData, setFormData] = useState({
    fullName: 'Jessica Thompson',
    role: 'Care Staff',
    email: 'jessica.thompson@elderlink.com',
    phone: '0771234569',
  });

  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setMessage('✅ Profile updated successfully!');
    setEditMode(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <RoleLayout title="My Profile">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-8">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold uppercase shadow-sm">
            {formData.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{formData.fullName}</h2>
            <p className="text-gray-500">{formData.role}</p>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-2 rounded text-sm animate-fade-in">
            {message}
          </div>
        )}

        {/* Profile Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full px-4 py-2 border rounded-md ${
                editMode ? 'bg-white' : 'bg-gray-100 text-gray-600'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              disabled
              className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full px-4 py-2 border rounded-md ${
                editMode ? 'bg-white' : 'bg-gray-100 text-gray-600'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full px-4 py-2 border rounded-md ${
                editMode ? 'bg-white' : 'bg-gray-100 text-gray-600'
              }`}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 flex flex-wrap gap-4">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium shadow"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-md text-sm font-medium shadow"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium shadow"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};


export default Profilestaff;