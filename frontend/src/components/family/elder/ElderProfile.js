// src/components/family/elder/ElderProfile.js
import React from 'react';
import { User, Calendar, MapPin, Phone, Heart, Shield, Pill } from 'lucide-react';
import { calculateAge, formatDate } from '../../../utils/helpers';

const ElderProfile = ({ elder }) => {
  const age = calculateAge(elder.dateOfBirth);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            {elder.photo ? (
              <img
                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${elder.photo}`}
                alt={`${elder.firstName} ${elder.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold">
                {elder.firstName?.charAt(0)}{elder.lastName?.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{elder.firstName} {elder.lastName}</h2>
            <p className="text-white/80">{age} years old • {elder.gender}</p>
            <p className="text-white/80">Born: {formatDate(elder.dateOfBirth)}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2 text-primary-500" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Address</label>
              <p className="font-medium">{elder.address}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <p className="font-medium">{elder.phone}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Emergency Contact</label>
              <p className="font-medium">{elder.emergencyContact}</p>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-primary-500" />
            Medical Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {elder.bloodType && (
              <div>
                <label className="text-sm text-gray-600">Blood Type</label>
                <p className="font-medium">{elder.bloodType}</p>
              </div>
            )}
            {elder.medicalHistory && (
              <div>
                <label className="text-sm text-gray-600">Medical History</label>
                <p className="font-medium">{elder.medicalHistory}</p>
              </div>
            )}
            {elder.allergies && (
              <div>
                <label className="text-sm text-gray-600">Allergies</label>
                <p className="font-medium text-red-600">{elder.allergies}</p>
              </div>
            )}
            {elder.chronicConditions && (
              <div>
                <label className="text-sm text-gray-600">Chronic Conditions</label>
                <p className="font-medium">{elder.chronicConditions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Medications */}
        {elder.currentMedications && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Pill className="w-5 h-5 mr-2 text-primary-500" />
              Current Medications
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-line">{elder.currentMedications}</p>
            </div>
          </div>
        )}

        {/* Healthcare Provider */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary-500" />
            Healthcare Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {elder.doctorName && (
              <div>
                <label className="text-sm text-gray-600">Primary Doctor</label>
                <p className="font-medium">{elder.doctorName}</p>
                {elder.doctorPhone && (
                  <p className="text-sm text-gray-600">{elder.doctorPhone}</p>
                )}
              </div>
            )}
            {elder.insuranceProvider && (
              <div>
                <label className="text-sm text-gray-600">Insurance Provider</label>
                <p className="font-medium">{elder.insuranceProvider}</p>
                {elder.insuranceNumber && (
                  <p className="text-sm text-gray-600">#{elder.insuranceNumber}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElderProfile;
