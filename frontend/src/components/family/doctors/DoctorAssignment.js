// frontend/src/components/family/doctors/DoctorAssignment.js
import React, { useState, useEffect } from 'react';
import { Plus, User, Calendar, Phone, Mail, Star, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorAssignmentService } from '../../../services/doctorAssignment';
import { elderService } from '../../../services/elder';
import AssignDoctorModal from './AssignDoctorModal';
import DoctorCard from './DoctorCard';
import Loading from '../../common/Loading';

const DoctorAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [elders, setElders] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedElder, setSelectedElder] = useState(null);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, eldersData, doctorsData] = await Promise.all([
        doctorAssignmentService.getFamilyDoctorAssignments({ status: filter }),
        elderService.getElders(),
        doctorAssignmentService.getAvailableDoctors()
      ]);

      setAssignments(assignmentsData.data || []);
      setElders(eldersData.elders || []);
      setAvailableDoctors(doctorsData.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load doctor assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDoctor = (elder) => {
    setSelectedElder(elder);
    setShowAssignModal(true);
  };

  const handleAssignmentSuccess = () => {
    setShowAssignModal(false);
    setSelectedElder(null);
    loadData();
    toast.success('Doctor assigned successfully!');
  };

  const handleTerminateAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to terminate this doctor assignment?')) {
      return;
    }

    try {
      await doctorAssignmentService.terminateAssignment(assignmentId, 'Terminated by family member');
      toast.success('Doctor assignment terminated successfully');
      loadData();
    } catch (error) {
      console.error('Failed to terminate assignment:', error);
      toast.error('Failed to terminate assignment');
    }
  };

  const getElderAssignments = (elderId) => {
    return assignments.filter(assignment => assignment.elder.id === elderId);
  };

  const getEldersWithoutPrimaryDoctor = () => {
    return elders.filter(elder => {
      const elderAssignments = getElderAssignments(elder.id);
      return !elderAssignments.some(assignment => 
        assignment.assignmentType === 'primary' && assignment.status === 'active'
      );
    });
  };

  if (loading) {
    return <Loading text="Loading doctor assignments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Doctor Assignments</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="terminated">Terminated</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <User className="w-10 h-10 text-blue-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold">{assignments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Calendar className="w-10 h-10 text-green-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Active Assignments</p>
              <p className="text-2xl font-bold">
                {assignments.filter(a => a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="w-10 h-10 text-yellow-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Elders Without Primary Doctor</p>
              <p className="text-2xl font-bold">{getEldersWithoutPrimaryDoctor().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Elders Without Primary Doctor Alert */}
      {getEldersWithoutPrimaryDoctor().length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
            <div>
              <h3 className="font-semibold text-yellow-800">Action Required</h3>
              <p className="text-yellow-700">
                {getEldersWithoutPrimaryDoctor().length} elder(s) need a primary doctor assigned.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {getEldersWithoutPrimaryDoctor().map(elder => (
              <button
                key={elder.id}
                onClick={() => handleAssignDoctor(elder)}
                className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm hover:bg-yellow-200 transition-colors"
              >
                Assign Doctor to {elder.firstName} {elder.lastName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="space-y-6">
        {elders.map(elder => {
          const elderAssignments = getElderAssignments(elder.id);
          
          return (
            <div key={elder.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {elder.photo ? (
                      <img
                        src={elder.photo}
                        alt={`${elder.firstName} ${elder.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {elder.firstName} {elder.lastName}
                    </h3>
                    <p className="text-gray-600">
                      Age: {new Date().getFullYear() - new Date(elder.dateOfBirth).getFullYear()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAssignDoctor(elder)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Doctor</span>
                </button>
              </div>

              {elderAssignments.length > 0 ? (
                <div className="space-y-4">
                  {elderAssignments.map(assignment => (
                    <DoctorCard
                      key={assignment.id}
                      assignment={assignment}
                      onTerminate={handleTerminateAssignment}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No doctors assigned to this elder</p>
                  <button
                    onClick={() => handleAssignDoctor(elder)}
                    className="mt-2 text-red-500 hover:text-red-600 font-medium"
                  >
                    Assign a doctor now
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {elders.length === 0 && (
        <div className="text-center py-16">
          <User className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No Elders Found</h2>
          <p className="text-gray-500 mb-8">
            You need to add elders first before assigning doctors to them.
          </p>
        </div>
      )}

      {/* Assign Doctor Modal */}
      {showAssignModal && (
        <AssignDoctorModal
          elder={selectedElder}
          availableDoctors={availableDoctors}
          onSuccess={handleAssignmentSuccess}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedElder(null);
          }}
        />
      )}
    </div>
  );
};

export default DoctorAssignment;