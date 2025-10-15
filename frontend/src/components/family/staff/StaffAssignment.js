import React, { useState, useEffect } from 'react';
import {
  User,
  UserCheck,
  UserX,
  Users,
  Star,
  Calendar,
  Phone,
  Mail,
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  Search,
  Shield,
  Activity,
  ArrowRight
} from 'lucide-react';
import { staffAssignmentService } from '../../../services/staffAssignment';
import { elderService } from '../../../services/elder';
import toast from 'react-hot-toast';

const StaffAssignment = () => {
  const [availableStaff, setAvailableStaff] = useState([]);
  const [elders, setElders] = useState([]);
  const [selectedElder, setSelectedElder] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedElder) {
      loadElderAssignment();
    }
  }, [selectedElder]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading staff assignment data...');
      
      const [staffData, eldersData] = await Promise.all([
        staffAssignmentService.getAvailableStaff(),
        elderService.getElders()
      ]);

      console.log('📊 Staff data received:', staffData);
      console.log('👥 Elders data received:', eldersData);

      // Handle staff data
      const staffList = staffData?.data?.staff || staffData?.staff || [];
      console.log('📋 Processing staff list:', staffList);
      setAvailableStaff(staffList);

      // Handle elders data - check different possible structures
      let eldersList = [];
      if (eldersData?.elders) {
        eldersList = eldersData.elders;
      } else if (eldersData?.data?.elders) {
        eldersList = eldersData.data.elders;
      } else if (Array.isArray(eldersData)) {
        eldersList = eldersData;
      } else {
        eldersList = [];
      }

      console.log('📋 Processing elders list:', eldersList);
      setElders(eldersList);

      if (eldersList.length === 0) {
        console.log('⚠️ No elders found in the response');
        toast.error('No elders found. Please add an elder profile first.');
      } else {
        console.log(`✅ Found ${eldersList.length} elders`);
      }

    } catch (error) {
      console.error('❌ Failed to load data:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      toast.error('Failed to load staff and elder data');
      setAvailableStaff([]);
      setElders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadElderAssignment = async () => {
    try {
      console.log('🔍 Loading assignment for elder:', selectedElder.id);
      const assignmentData = await staffAssignmentService.getElderStaffAssignment(selectedElder.id);
      console.log('📋 Assignment data:', assignmentData);
      setCurrentAssignment(assignmentData.data?.assignment || null);
    } catch (error) {
      console.error('❌ Failed to load elder assignment:', error);
      setCurrentAssignment(null);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedElder || !selectedStaff) return;

    try {
      setAssigning(true);
      console.log('🔄 Assigning staff:', selectedStaff.id, 'to elder:', selectedElder.id);
      
      await staffAssignmentService.assignElderToStaff(selectedElder.id, selectedStaff.id);
      
      toast.success(`${selectedElder.firstName} assigned to ${selectedStaff.firstName} ${selectedStaff.lastName}`);
      
      // Reload data
      await loadData();
      await loadElderAssignment();
      
      setShowAssignModal(false);
      setSelectedStaff(null);
    } catch (error) {
      console.error('❌ Failed to assign staff:', error);
      const message = error.response?.data?.message || 'Failed to assign staff member';
      toast.error(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignStaff = async () => {
    if (!selectedElder || !currentAssignment) return;

    try {
      setAssigning(true);
      console.log('🔄 Unassigning staff from elder:', selectedElder.id);
      
      await staffAssignmentService.unassignElderFromStaff(selectedElder.id);
      
      toast.success(`${selectedElder.firstName} unassigned from staff`);
      
      // Reload data
      await loadData();
      await loadElderAssignment();
    } catch (error) {
      console.error('❌ Failed to unassign staff:', error);
      const message = error.response?.data?.message || 'Failed to unassign staff member';
      toast.error(message);
    } finally {
      setAssigning(false);
    }
  };

  const getFilteredStaff = () => {
    return availableStaff.filter(staff => {
      const matchesSearch = searchTerm === '' || 
        `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialization = specialization === 'all' || 
        staff.specialization?.toLowerCase() === specialization.toLowerCase();

      return matchesSearch && matchesSpecialization;
    });
  };

  const getExperienceLevel = (years) => {
    if (years < 3) return { label: 'Junior', color: 'bg-blue-100 text-blue-800' };
    if (years <= 7) return { label: 'Mid-Level', color: 'bg-green-100 text-green-800' };
    return { label: 'Senior', color: 'bg-purple-100 text-purple-800' };
  };

  const getWorkloadStatus = (workload) => {
    if (workload <= 3) return { label: 'Available', color: 'bg-green-100 text-green-800' };
    if (workload <= 7) return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Busy', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Staff Assignment</h1>
            <p className="text-gray-600">Assign dedicated staff members to your elders</p>
          </div>
        </div>
        
        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
          <p className="text-gray-600">
            📊 Status: {elders.length} elders found, {availableStaff.length} staff available
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Elder Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            Select Elder ({elders.length})
          </h2>
          
          {elders.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No elders found</p>
              <p className="text-sm text-gray-400">Add an elder profile to get started</p>
              <button
                onClick={loadData}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Refresh Data
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {elders.map(elder => (
                <div
                  key={elder.id}
                  onClick={() => setSelectedElder(elder)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedElder?.id === elder.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {elder.photo ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/elders/${elder.photo}`}
                          alt={elder.firstName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span 
                        className={`text-lg font-bold text-gray-600 ${elder.photo ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
                      >
                        {elder.firstName?.charAt(0)}{elder.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {elder.firstName} {elder.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {elder.dateOfBirth ? 
                          `${new Date().getFullYear() - new Date(elder.dateOfBirth).getFullYear()} years old` :
                          'Age not specified'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Assignment */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Current Assignment
          </h2>
          
          {!selectedElder ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select an elder to view assignment</p>
            </div>
          ) : currentAssignment ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {currentAssignment.staff?.photo ? (
                      <img
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/staff/${currentAssignment.staff.photo}`}
                        alt={currentAssignment.staff.firstName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span 
                      className={`text-lg font-bold text-gray-600 ${currentAssignment.staff?.photo ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
                    >
                      {currentAssignment.staff?.firstName?.charAt(0)}{currentAssignment.staff?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800">
                      {currentAssignment.staff.firstName} {currentAssignment.staff.lastName}
                    </h3>
                    <p className="text-sm text-green-600">
                      {currentAssignment.staff.specialization || 'General Care'}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{currentAssignment.staff.email}</span>
                  </div>
                  {currentAssignment.staff.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{currentAssignment.staff.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      Assigned: {new Date(currentAssignment.assignedAt || currentAssignment.assignedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Reassign
                </button>
                <button
                  onClick={handleUnassignStaff}
                  disabled={assigning}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {assigning ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <UserX className="w-4 h-4" />
                  )}
                  Unassign
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No staff assigned to {selectedElder.firstName}</p>
              <button
                onClick={() => setShowAssignModal(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 mx-auto"
              >
                <UserCheck className="w-4 h-4" />
                Assign Staff
              </button>
            </div>
          )}
        </div>

        {/* Available Staff */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Available Staff ({availableStaff.length})
          </h2>
          
          {/* Search and Filter */}
          <div className="space-y-3 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Specializations</option>
              <option value="personal care">Personal Care</option>
              <option value="nursing care">Nursing Care</option>
              <option value="physical therapy">Physical Therapy</option>
              <option value="mental health support">Mental Health Support</option>
            </select>
          </div>

          {/* Staff List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {getFilteredStaff().length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No staff found</p>
                <button
                  onClick={loadData}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  Refresh
                </button>
              </div>
            ) : (
              getFilteredStaff().map(staff => {
                const experienceLevel = getExperienceLevel(staff.experience || 0);
                const workloadStatus = getWorkloadStatus(staff.currentWorkload || 0);
                
                return (
                  <div
                    key={staff.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {staff.photo ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/staff/${staff.photo}`}
                            alt={staff.firstName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span 
                          className={`text-sm font-bold text-gray-600 ${staff.photo ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
                        >
                          {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {staff.firstName} {staff.lastName}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {staff.specialization || 'General Care'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${experienceLevel.color}`}>
                        {experienceLevel.label}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${workloadStatus.color}`}>
                        {workloadStatus.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                Assign Staff to {selectedElder?.firstName} {selectedElder?.lastName}
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <UserX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {getFilteredStaff().map(staff => {
                const experienceLevel = getExperienceLevel(staff.experience || 0);
                const workloadStatus = getWorkloadStatus(staff.currentWorkload || 0);
                
                return (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedStaff?.id === staff.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {staff.photo ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/staff/${staff.photo}`}
                            alt={staff.firstName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span 
                          className={`text-lg font-bold text-gray-600 ${staff.photo ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
                        >
                          {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {staff.firstName} {staff.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {staff.specialization || 'General Care'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{staff.email}</span>
                      </div>
                      {staff.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{staff.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{staff.experience || 0} years experience</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${experienceLevel.color}`}>
                        {experienceLevel.label}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${workloadStatus.color}`}>
                        {workloadStatus.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStaff}
                disabled={!selectedStaff || assigning}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {assigning ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
                Assign Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAssignment;