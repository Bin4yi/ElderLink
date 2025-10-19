// src/components/doctor/patients/PatientList.js

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
  RefreshCw
} from 'lucide-react';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    fromAppointments: 0,
    fromAssignments: 0,
    active: 0,
    unique: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
    pages: 1
  });

  // Mock patient data - replace with API call
  const mockPatients = [
    {
      id: 1,
      name: 'Eleanor Johnson',
      age: 78,
      gender: 'Female',
      phone: '+1 (555) 123-4567',
      email: 'eleanor.johnson@email.com',
      address: '123 Oak Street, Springfield, IL',
      bloodType: 'O+',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-01-22',
      riskLevel: 'medium',
      conditions: ['Hypertension', 'Diabetes Type 2'],
      medications: ['Lisinopril', 'Metformin'],
      vitals: {
        bloodPressure: '140/90',
        heartRate: 72,
        temperature: '98.6°F',
        weight: '165 lbs'
      },
      status: 'active',
      emergencyContact: 'Sarah Johnson - Daughter',
      emergencyPhone: '+1 (555) 987-6543',
      insurance: 'Medicare',
      avatar: null
    },
    {
      id: 2,
      name: 'Robert Smith',
      age: 82,
      gender: 'Male',
      phone: '+1 (555) 234-5678',
      email: 'robert.smith@email.com',
      address: '456 Pine Avenue, Springfield, IL',
      bloodType: 'A-',
      lastVisit: '2024-01-10',
      nextAppointment: '2024-01-25',
      riskLevel: 'high',
      conditions: ['Heart Disease', 'Arthritis'],
      medications: ['Aspirin', 'Atorvastatin'],
      vitals: {
        bloodPressure: '160/95',
        heartRate: 68,
        temperature: '99.1°F',
        weight: '180 lbs'
      },
      status: 'active',
      emergencyContact: 'Michael Smith - Son',
      emergencyPhone: '+1 (555) 876-5432',
      insurance: 'Blue Cross',
      avatar: null
    },
    {
      id: 3,
      name: 'Mary Wilson',
      age: 75,
      gender: 'Female',
      phone: '+1 (555) 345-6789',
      email: 'mary.wilson@email.com',
      address: '789 Elm Drive, Springfield, IL',
      bloodType: 'B+',
      lastVisit: '2024-01-08',
      nextAppointment: '2024-01-20',
      riskLevel: 'low',
      conditions: ['Osteoporosis'],
      medications: ['Calcium supplements'],
      vitals: {
        bloodPressure: '120/80',
        heartRate: 75,
        temperature: '98.4°F',
        weight: '140 lbs'
      },
      status: 'active',
      emergencyContact: 'James Wilson - Husband',
      emergencyPhone: '+1 (555) 765-4321',
      insurance: 'Aetna',
      avatar: null
    },
    {
      id: 4,
      name: 'James Brown',
      age: 80,
      gender: 'Male',
      phone: '+1 (555) 456-7890',
      email: 'james.brown@email.com',
      address: '321 Maple Lane, Springfield, IL',
      bloodType: 'AB+',
      lastVisit: '2024-01-12',
      nextAppointment: '2024-01-28',
      riskLevel: 'medium',
      conditions: ['COPD', 'Hypertension'],
      medications: ['Albuterol', 'Lisinopril'],
      vitals: {
        bloodPressure: '135/85',
        heartRate: 78,
        temperature: '98.8°F',
        weight: '170 lbs'
      },
      status: 'active',
      emergencyContact: 'Linda Brown - Wife',
      emergencyPhone: '+1 (555) 654-3210',
      insurance: 'Medicare',
      avatar: null
    },
    {
      id: 5,
      name: 'Patricia Davis',
      age: 77,
      gender: 'Female',
      phone: '+1 (555) 567-8901',
      email: 'patricia.davis@email.com',
      address: '654 Cedar Street, Springfield, IL',
      bloodType: 'O-',
      lastVisit: '2024-01-05',
      nextAppointment: null,
      riskLevel: 'low',
      conditions: ['Mild Cognitive Impairment'],
      medications: ['Donepezil'],
      vitals: {
        bloodPressure: '125/75',
        heartRate: 70,
        temperature: '98.2°F',
        weight: '155 lbs'
      },
      status: 'inactive',
      emergencyContact: 'Robert Davis - Son',
      emergencyPhone: '+1 (555) 543-2109',
      insurance: 'Humana',
      avatar: null
    }
  ];

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await doctorPatientService.getDoctorPatients({
        search: searchTerm,
        status: selectedFilter === 'active' || selectedFilter === 'inactive' ? selectedFilter : undefined,
        riskLevel: selectedFilter.includes('risk') ? selectedFilter.replace('-risk', '') : undefined,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success) {
        setPatients(response.data || []);
        setStatistics(response.statistics || {
          total: 0,
          fromAppointments: 0,
          fromAssignments: 0,
          active: 0,
          unique: 0
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
  }, [selectedFilter]);

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

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (patient.phone && patient.phone.includes(searchTerm));
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'active' && patient.status === 'active') ||
                         (selectedFilter === 'inactive' && patient.status === 'inactive') ||
                         (selectedFilter === 'high-risk' && patient.riskLevel === 'high') ||
                         (selectedFilter === 'medium-risk' && patient.riskLevel === 'medium') ||
                         (selectedFilter === 'low-risk' && patient.riskLevel === 'low');
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'age':
        aValue = a.age;
        bValue = b.age;
        break;
      case 'lastVisit':
        aValue = new Date(a.lastVisit);
        bValue = new Date(b.lastVisit);
        break;
      case 'riskLevel':
        const riskOrder = { high: 3, medium: 2, low: 1 };
        aValue = riskOrder[a.riskLevel];
        bValue = riskOrder[b.riskLevel];
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleLayout title="Patient Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Management</h1>
              <p className="text-gray-600">Manage and monitor your elderly patients</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Patients</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.unique}</p>
                <p className="text-xs text-gray-500">Total: {statistics.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">From Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.fromAppointments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">From Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.fromAssignments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.riskLevel === 'high').length}
                </p>
              </div>
            </div>
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
                  placeholder="Search patients..."
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
                <option value="all">All Patients</option>
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
                {sortOrder === 'asc' ? '↑' : '↓'}
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
                      checked={selectedPatients.length === filteredPatients.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Family Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
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
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.age} years, {patient.gender}</div>
                          <div className="text-sm text-gray-500">Blood Type: {patient.bloodType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {patient.phone || 'N/A'}
                      </div>
                      {patient.email && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {patient.email}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {patient.address ? patient.address.split(',')[0] : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(patient.riskLevel)}`}>
                          {patient.riskLevel.charAt(0).toUpperCase() + patient.riskLevel.slice(1)} Risk
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(patient.status)}`}>
                          {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                        </span>
                        {patient.source && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            patient.source === 'appointment' ? 'bg-purple-100 text-purple-800' :
                            patient.source === 'assignment' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {patient.source === 'both' ? 'Appt & Assigned' : 
                             patient.source === 'appointment' ? 'Appointment' : 'Assigned'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {patient.vitals ? (
                          <>
                            <div>BP: {patient.vitals.bloodPressure}</div>
                            <div>HR: {patient.vitals.heartRate} bpm</div>
                          </>
                        ) : (
                          <div>No vitals recorded</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {patient.lastVisit 
                          ? new Date(patient.lastVisit).toLocaleDateString()
                          : 'No visits yet'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {patient.nextAppointment 
                          ? new Date(patient.nextAppointment).toLocaleDateString()
                          : 'Not scheduled'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {patient.familyMember ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{patient.familyMember.name}</div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            {patient.familyMember.phone || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {patient.familyMember.email}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No family contact</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Video className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {filteredPatients.length} of {patients.length} patients
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default PatientList;