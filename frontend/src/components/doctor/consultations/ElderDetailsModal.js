// src/components/doctor/consultations/ElderDetailsModal.js
import React from 'react';
import Modal from '../../common/Modal';
import { 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Heart, 
  AlertCircle,
  Pill,
  FileText,
  Mail,
  Users
} from 'lucide-react';

const ElderDetailsModal = ({ elder, isOpen, onClose }) => {
  if (!elder) return null;

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Elder Patient Details"
      size="large"
    >
      <div className="space-y-6">
        {/* Header Section with Photo */}
        <div className="flex items-start gap-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
          <div className="relative">
            {elder.photo ? (
              <img
                src={elder.photo}
                alt={`${elder.firstName} ${elder.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center border-4 border-white shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Active
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {elder.firstName} {elder.lastName}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>
                  <strong>Age:</strong> {calculateAge(elder.dateOfBirth)} years
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 text-blue-500" />
                <span>
                  <strong>Gender:</strong> {elder.gender ? elder.gender.charAt(0).toUpperCase() + elder.gender.slice(1) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-500" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Phone Number</label>
              <p className="text-gray-900">{elder.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Emergency Contact</label>
              <p className="text-gray-900">{elder.emergencyContact || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500" />
                Address
              </label>
              <p className="text-gray-900">{elder.address || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200 p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Medical Information
          </h3>
          <div className="space-y-4">
            {elder.bloodType && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Blood Type</label>
                <p className="text-gray-900 font-semibold text-lg">{elder.bloodType}</p>
              </div>
            )}

            {elder.chronicConditions && (
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Chronic Conditions
                </label>
                <p className="text-gray-900 bg-white p-3 rounded-lg mt-1">
                  {elder.chronicConditions}
                </p>
              </div>
            )}

            {elder.allergies && (
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Allergies
                </label>
                <p className="text-gray-900 bg-white p-3 rounded-lg mt-1 text-red-600 font-medium">
                  {elder.allergies}
                </p>
              </div>
            )}

            {elder.currentMedications && (
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-blue-500" />
                  Current Medications
                </label>
                <p className="text-gray-900 bg-white p-3 rounded-lg mt-1">
                  {elder.currentMedications}
                </p>
              </div>
            )}

            {elder.medicalHistory && (
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Medical History
                </label>
                <p className="text-gray-900 bg-white p-3 rounded-lg mt-1">
                  {elder.medicalHistory}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Primary Doctor Information */}
        {(elder.doctorName || elder.doctorPhone) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Primary Doctor
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {elder.doctorName && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Doctor Name</label>
                  <p className="text-gray-900">{elder.doctorName}</p>
                </div>
              )}
              {elder.doctorPhone && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Doctor Phone</label>
                  <p className="text-gray-900">{elder.doctorPhone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insurance Information */}
        {(elder.insuranceProvider || elder.insuranceNumber) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Insurance Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {elder.insuranceProvider && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Provider</label>
                  <p className="text-gray-900">{elder.insuranceProvider}</p>
                </div>
              )}
              {elder.insuranceNumber && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Policy Number</label>
                  <p className="text-gray-900">{elder.insuranceNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ElderDetailsModal;
