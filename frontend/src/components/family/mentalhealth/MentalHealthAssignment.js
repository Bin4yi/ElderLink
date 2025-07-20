// frontend/src/components/family/mentalHealth/MentalHealthAssignment.js
import React, { useState, useEffect } from 'react';
import { Plus, User, Calendar, Phone, Mail, Star, AlertCircle, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import MentalHealthCard from './MentalHealthCard';
import Loading from '../../common/Loading';

// --- Mock Data ---
const MOCK_COORDINATORS = [
  { id: 'mhc1', firstName: 'Priya', lastName: 'Fernando', phone: '0712345678', email: 'priya@mentalhealth.com', rating: 4.8 },
  { id: 'mhc2', firstName: 'Ruwan', lastName: 'Perera', phone: '0771234567', email: 'ruwan@mentalhealth.com', rating: 4.6 }
];

const MOCK_ELDERS = [
  { id: 'elder1', firstName: 'Sunil', lastName: 'De Silva', dateOfBirth: '1950-05-12', photo: null },
  { id: 'elder2', firstName: 'Kamala', lastName: 'Wijesinghe', dateOfBirth: '1945-09-23', photo: null }
];

const MOCK_ASSIGNMENTS = [
  {
    id: 'assign1',
    elder: MOCK_ELDERS[0],
    consultant: {
      user: MOCK_COORDINATORS[0],
      specialization: 'Geriatric Mental Health',
      rating: 4.8,
      experience: 12,
      languages: ['English', 'Sinhala'],
      specializations: ['Depression', 'Anxiety'],
      about: 'Experienced in elder mental health support.',
      location: 'Colombo'
    },
    assignmentType: 'primary',
    status: 'active',
    assignedDate: '2025-07-01',
    sessionFee: 1500,
    notes: 'Monthly check-ins required.',
    priority: 'high'
  }
];

const MentalHealthAssignment = () => {
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);
  const [elders, setElders] = useState(MOCK_ELDERS);
  const [availableCoordinators, setAvailableCoordinators] = useState(MOCK_COORDINATORS);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedElder, setSelectedElder] = useState(null);
  const [filter, setFilter] = useState('active');

  // Remove async loadData and service calls

  const handleAssignCoordinator = (elder) => {
    setSelectedElder(elder);
    setShowAssignModal(true);
  };

  const handleAssignmentSuccess = (coordinator) => {
    setAssignments(prev => [
      ...prev,
      {
        id: `assign${prev.length + 1}`,
        elder: selectedElder, // <-- FIX: add this line
        consultant: {
          user: coordinator,
          specialization: 'General Mental Health',
          rating: coordinator.rating,
          experience: 5,
          languages: ['English'],
          specializations: ['General Support'],
          about: 'Coordinator for elder support.',
          location: 'Sri Lanka'
        },
        assignmentType: 'primary',
        status: 'active',
        assignedDate: new Date().toISOString(),
        sessionFee: 1200,
        notes: '',
        priority: 'medium'
      }
    ]);
    setShowAssignModal(false);
    setSelectedElder(null);
    toast.success('Mental Health Coordinator assigned successfully!');
  };

  const handleTerminateAssignment = (assignmentId) => {
    if (!window.confirm('Are you sure you want to terminate this mental health assignment?')) {
      return;
    }
    setAssignments(prev =>
      prev.map(a =>
        a.id === assignmentId ? { ...a, status: 'terminated' } : a
      )
    );
    toast.success('Mental health assignment terminated successfully');
  };

  const getElderAssignments = (elderId) => {
    return assignments.filter(assignment => assignment.elder.id === elderId);
  };

  const getEldersWithoutPrimaryCoordinator = () => {
    return elders.filter(elder => {
      const elderAssignments = getElderAssignments(elder.id);
      return !elderAssignments.some(assignment =>
        assignment.assignmentType === 'primary' && assignment.status === 'active'
      );
    });
  };

  if (loading) {
    return <Loading text="Loading mental health assignments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-purple-500" />
          <h1 className="text-2xl font-bold text-gray-800">Mental Health Coordinator Assignments</h1>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            <Brain className="w-10 h-10 text-purple-500 mr-4" />
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
              <p className="text-sm text-gray-600">Elders Without Coordinator</p>
              <p className="text-2xl font-bold">{getEldersWithoutPrimaryCoordinator().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Elders Without Primary Coordinator Alert */}
      {getEldersWithoutPrimaryCoordinator().length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-purple-500 mr-2" />
            <div>
              <h3 className="font-semibold text-purple-800">Mental Health Support Needed</h3>
              <p className="text-purple-700">
                {getEldersWithoutPrimaryCoordinator().length} elder(s) need a mental health coordinator assigned.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {getEldersWithoutPrimaryCoordinator().map(elder => (
              <button
                key={elder.id}
                onClick={() => handleAssignCoordinator(elder)}
                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition-colors"
              >
                Assign Coordinator to {elder.firstName} {elder.lastName}
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
                  onClick={() => handleAssignCoordinator(elder)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Coordinator</span>
                </button>
              </div>

              {elderAssignments.length > 0 ? (
                <div className="space-y-4">
                  {elderAssignments.map(assignment => (
                    <MentalHealthCard
                      key={assignment.id}
                      assignment={assignment}
                      onTerminate={handleTerminateAssignment}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No mental health coordinator assigned to this elder</p>
                  <button
                    onClick={() => handleAssignCoordinator(elder)}
                    className="mt-2 text-purple-500 hover:text-purple-600 font-medium"
                  >
                    Assign a coordinator now
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
            You need to add elders first before assigning mental health coordinators.
          </p>
        </div>
      )}

      {/* Assign Mental Health Coordinator Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Assign Mental Health Coordinator</h3>
            <div className="space-y-4">
              {availableCoordinators.map(coordinator => (
                <button
                  key={coordinator.id}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => handleAssignmentSuccess(coordinator)}
                >
                  <div className="font-medium">{coordinator.firstName} {coordinator.lastName}</div>
                  <div className="text-sm text-gray-600">{coordinator.email} | {coordinator.phone}</div>
                  <div className="text-yellow-600 text-sm">Rating: {coordinator.rating} <Star className="inline w-4 h-4" /></div>
                </button>
              ))}
            </div>
            <button
              className="mt-6 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedElder(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentalHealthAssignment;