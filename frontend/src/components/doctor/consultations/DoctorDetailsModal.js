// src/components/doctor/consultations/DoctorDetailsModal.js
import React from 'react';
import Modal from '../../common/Modal';
import { 
  User, 
  Mail, 
  Phone, 
  Award, 
  Briefcase,
  Calendar,
  Star,
  MapPin
} from 'lucide-react';

const DoctorDetailsModal = ({ doctor, isOpen, onClose }) => {
  if (!doctor) return null;

  // Doctor data might be nested (from monthly sessions)
  const doctorData = doctor.user || doctor;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Doctor Information"
      size="medium"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start gap-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
          <div className="relative">
            {doctorData.profilePicture ? (
              <img
                src={doctorData.profilePicture}
                alt={`Dr. ${doctorData.firstName} ${doctorData.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center border-4 border-white shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Available
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Dr. {doctorData.firstName} {doctorData.lastName}
            </h2>
            {doctor.specialization && (
              <p className="text-indigo-600 font-semibold mb-2">{doctor.specialization}</p>
            )}
            {doctor.qualification && (
              <p className="text-gray-600 text-sm">{doctor.qualification}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-500" />
            Contact Information
          </h3>
          <div className="space-y-3">
            {doctorData.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <label className="text-xs font-semibold text-gray-600">Email</label>
                  <p className="text-gray-900">{doctorData.email}</p>
                </div>
              </div>
            )}
            {doctorData.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <label className="text-xs font-semibold text-gray-600">Phone</label>
                  <p className="text-gray-900">{doctorData.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Information */}
        {(doctor.specialization || doctor.qualification || doctor.licenseNumber || doctor.yearsOfExperience) && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              Professional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctor.specialization && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    Specialization
                  </label>
                  <p className="text-gray-900 font-medium">{doctor.specialization}</p>
                </div>
              )}
              {doctor.qualification && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-500" />
                    Qualification
                  </label>
                  <p className="text-gray-900 font-medium">{doctor.qualification}</p>
                </div>
              )}
              {doctor.licenseNumber && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">License Number</label>
                  <p className="text-gray-900 font-mono">{doctor.licenseNumber}</p>
                </div>
              )}
              {doctor.yearsOfExperience && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Experience
                  </label>
                  <p className="text-gray-900 font-medium">{doctor.yearsOfExperience} years</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bio/Description */}
        {doctor.bio && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
            <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
          </div>
        )}

        {/* Services/Expertise */}
        {doctor.services && doctor.services.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Services Offered</h3>
            <div className="flex flex-wrap gap-2">
              {doctor.services.map((service, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Consultation Fee */}
        {doctor.consultationFee && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-gray-600">Consultation Fee</label>
                <p className="text-2xl font-bold text-green-600">${doctor.consultationFee}</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Languages */}
        {doctor.languages && doctor.languages.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {doctor.languages.map((language, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DoctorDetailsModal;
