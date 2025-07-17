import React, { useState, useEffect } from 'react';
import { 
  User, 
  Stethoscope, 
  Calendar, 
  Clock, 
  Star, 
  Phone, 
  Mail, 
  Award,
  UserPlus,
  UserMinus,
  AlertCircle
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';
import { familyDoctorAssignmentService } from '../../../services/familyDoctorAssignment';
import { elderService } from '../../../services/elder';
import toast from 'react-hot-toast';

const DoctorAssignment = () => {
  const [doctors, setDoctors] = useState([]);
  const [elders, setElders] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedElder, setSelectedElder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorsData, eldersData, assignmentsData] = await Promise.all([
        familyDoctorAssignmentService.getAvailableDoctors(),
        elderService.getElders(),
        familyDoctorAssignmentService.getFamilyDoctorAssignments()
      ]);

      setDoctors(doctorsData || []);
      setElders(eldersData.elders || []);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load doctor assignment data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDoctor = async () => {
    if (!selectedDoctor || !selectedElder) {
      toast.error('Please select both a doctor and an elder');
      return;
    }

    try {
      setAssigning(true);
      await familyDoctorAssignmentService.assignDoctor({
        doctorId: selectedDoctor.id,
        elderId: selectedElder.id
      });

      toast.success(`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName} assigned to ${selectedElder.firstName}`);
      setShowAssignModal(false);
      setSelectedDoctor(null);
      setSelectedElder(null);
      await loadData();
    } catch (error) {
      console.error('Failed to assign doctor:', error);
      toast.error('Failed to assign doctor');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this doctor assignment?')) {
      return;
    }

    try {
      await familyDoctorAssignmentService.removeAssignment(assignmentId);
      toast.success('Doctor assignment removed successfully');
      await loadData();
    } catch (error) {
      console.error('Failed to remove assignment:', error);
      toast.error('Failed to remove doctor assignment');
    }
  };

  if (loading) {
    return (
      <RoleLayout title="Doctor Assignment">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="Doctor Assignment">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Assignment</h1>
              <p className="text-gray-600">Assign dedicated doctors to your elders</p>
            </div>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Assign Doctor
            </button>
          </div>
        </div>

        {/* Current Assignments */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Current Doctor Assignments</h2>
          </div>
          
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No doctor assignments yet</p>
              <p className="text-sm text-gray-400">Click "Assign Doctor" to get started</p>
            </div>
          ) : (
            <div className="divide-y">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Dr. {assignment.doctor?.firstName} {assignment.doctor?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{assignment.doctor?.specialization}</p>
                        <p className="text-sm text-blue-600">
                          Assigned to: {assignment.elder?.firstName} {assignment.elder?.lastName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Active
                      </span>
                      <button
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Doctors */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Available Doctors</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Dr. {doctor.firstName} {doctor.lastName}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{doctor.email}</span>
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setShowAssignModal(true);
                  }}
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Select Doctor
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Assign Doctor to Elder</h3>
              
              {/* Doctor Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Doctor
                </label>
                <select
                  value={selectedDoctor?.id || ''}
                  onChange={(e) => {
                    const doctor = doctors.find(d => d.id === e.target.value);
                    setSelectedDoctor(doctor);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Elder Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Elder
                </label>
                <select
                  value={selectedElder?.id || ''}
                  onChange={(e) => {
                    const elder = elders.find(e => e.id === e.target.value);
                    setSelectedElder(elder);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose an elder...</option>
                  {elders.map((elder) => (
                    <option key={elder.id} value={elder.id}>
                      {elder.firstName} {elder.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedDoctor(null);
                    setSelectedElder(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignDoctor}
                  disabled={!selectedDoctor || !selectedElder || assigning}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {assigning ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Assign Doctor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default DoctorAssignment;