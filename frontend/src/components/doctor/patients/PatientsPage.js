// frontend/src/components/doctor/patients/PatientsPage.js

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { doctorPatientService } from '../../../services/doctorPatient';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Heart, 
  Activity, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Video,
  Edit,
  MoreVertical,
  Download,
  Upload,
  RefreshCw,
  Stethoscope,
  UserCheck,
  CalendarDays
} from 'lucide-react';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments', 'assignments'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    unique: 0,
    fromAppointments: 0,
    fromAssignments: 0,
    active: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
    pages: 1
  });

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await doctorPatientService.getDoctorPatients({
        search: searchTerm,
        status: selectedFilter === 'active' || selectedFilter === 'inactive' ? selectedFilter : undefined,
        riskLevel: selectedFilter.includes('risk') ? selectedFilter.replace('-risk', '') : undefined,
        source: activeTab === 'appointments' ? 'appointment' : activeTab === 'assignments' ? 'assignment' : undefined,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success) {
        setPatients(response.data || []);
        setStatistics(response.statistics || {
          total: 0,
          unique: 0,
          fromAppointments: 0,
          fromAssignments: 0,
          active: 0,
          highRisk: 0,
          mediumRisk: 0,
          lowRisk: 0
        });
        setPagination(response.pagination || {
          total: 0,
          page: 1,
          limit: 100,
          pages: 0
        });
        console.log('✅ Patients loaded:', response.data?.length || 0);
      } else {
        console.error('API returned error:', response);
        toast.error(response.message || 'Failed to load patients');
      }
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [selectedFilter, activeTab]);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchPatients();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleRefresh = () => {
    fetchPatients();
    toast.success('Patient list refreshed');
  };

  // Filter patients based on active tab
  const getFilteredPatients = () => {
    let filtered = patients;

    // Apply tab filter
    if (activeTab === 'appointments') {
      filtered = filtered.filter(p => p.source === 'appointment' || p.source === 'both');
    } else if (activeTab === 'assignments') {
      filtered = filtered.filter(p => p.source === 'assignment' || p.source === 'both');
    }

    // Apply additional filters
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'active' || selectedFilter === 'inactive') {
        filtered = filtered.filter(p => p.status === selectedFilter);
      } else if (selectedFilter.includes('-risk')) {
        const risk = selectedFilter.replace('-risk', '');
        filtered = filtered.filter(p => p.riskLevel === risk);
      }
    }

    // Sort patients
    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 'lastVisit':
          aValue = a.lastVisit ? new Date(a.lastVisit) : new Date(0);
          bValue = b.lastVisit ? new Date(b.lastVisit) : new Date(0);
          break;
        case 'riskLevel':
          const riskOrder = { high: 3, medium: 2, low: 1 };
          aValue = riskOrder[a.riskLevel] || 0;
          bValue = riskOrder[b.riskLevel] || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const filteredPatients = getFilteredPatients();

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'appointment': return 'bg-purple-100 text-purple-800';
      case 'assignment': return 'bg-indigo-100 text-indigo-800';
      case 'both': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'appointment': return 'Appointment';
      case 'assignment': return 'Assigned';
      case 'both': return 'Appt & Assigned';
      default: return 'Unknown';
    }
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPatients(
      selectedPatients.length === filteredPatients.length 
        ? [] 
        : filteredPatients.map(p => p.id)
    );
  };

  if (loading) {
    return (
      <RoleLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading patients...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                My Patients
              </h1>
              <p className="text-gray-600">Manage and monitor your elderly patients from appointments and assignments</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">From Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.fromAppointments}</p>
                <p className="text-xs text-gray-500">Appointment patients</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">From Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.fromAssignments}</p>
                <p className="text-xs text-gray-500">Assigned patients</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.highRisk}</p>
                <p className="text-xs text-gray-500">Require attention</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'appointments'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Appointment Patients
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'appointments' ? 'bg-purple-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {statistics.fromAppointments}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'assignments'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Assigned Patients
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'assignments' ? 'bg-indigo-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {statistics.fromAssignments}
              </span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patients by name, email, or phone..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="high-risk">High Risk</option>
                <option value="medium-risk">Medium Risk</option>
                <option value="low-risk">Low Risk</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="age">Sort by Age</option>
                <option value="lastVisit">Sort by Last Visit</option>
                <option value="riskLevel">Sort by Risk Level</option>
              </select>
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPatients.length === filteredPatients.length && filteredPatients.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Family Contact
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Patients Found</h3>
                      <p className="text-gray-500">
                        {activeTab === 'appointments' 
                          ? 'No patients from appointments yet'
                          : activeTab === 'assignments'
                          ? 'No assigned patients yet'
                          : 'No patients found matching your criteria'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPatients.includes(patient.id)}
                          onChange={() => handleSelectPatient(patient.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {patient.photo ? (
                            <img
                              src={patient.photo}
                              alt={patient.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {patient.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">
                              {patient.age ? `${patient.age} years` : 'Age unknown'}, {patient.gender || 'N/A'}
                            </div>
                            {patient.bloodType && (
                              <div className="text-sm text-gray-500">
                                🩸 {patient.bloodType}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {patient.phone && (
                          <div className="text-sm text-gray-500 flex items-center mb-1">
                            <Phone className="w-4 h-4 mr-1" />
                            {patient.phone}
                          </div>
                        )}
                        {patient.email && (
                          <div className="text-sm text-gray-500 flex items-center mb-1">
                            <Mail className="w-4 h-4 mr-1" />
                            {patient.email}
                          </div>
                        )}
                        {patient.address && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {patient.address.split(',')[0]}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold inline-flex items-center gap-1 w-fit ${getRiskColor(patient.riskLevel)}`}>
                            {patient.riskLevel === 'high' && <AlertTriangle className="w-3 h-3" />}
                            {patient.riskLevel.charAt(0).toUpperCase() + patient.riskLevel.slice(1)} Risk
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold inline-flex items-center gap-1 w-fit ${getStatusColor(patient.status)}`}>
                            {patient.status === 'active' && <CheckCircle className="w-3 h-3" />}
                            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getSourceColor(patient.source)}`}>
                          {getSourceLabel(patient.source)}
                        </span>
                        {patient.appointmentCount > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {patient.appointmentCount} appointment{patient.appointmentCount > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {patient.lastVisit 
                            ? new Date(patient.lastVisit).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'No visits yet'
                          }
                        </div>
                        {patient.assignmentDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Assigned: {new Date(patient.assignmentDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {patient.familyMember ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{patient.familyMember.name}</div>
                            {patient.familyMember.phone && (
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <Phone className="w-3 h-3 mr-1" />
                                {patient.familyMember.phone}
                              </div>
                            )}
                            {patient.familyMember.email && (
                              <div className="text-xs text-gray-500 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {patient.familyMember.email}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No family contact</div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredPatients.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-semibold">{filteredPatients.length}</span> of{' '}
                <span className="font-semibold">{statistics.unique}</span> patients
              </p>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default PatientsPage;
