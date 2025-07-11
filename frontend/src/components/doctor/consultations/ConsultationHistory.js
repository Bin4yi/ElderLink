// src/components/doctor/consultations/ConsultationHistory.js

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { 
  Stethoscope,
  Video,
  Calendar,
  Clock,
  Search,
  Plus,
  Eye,
  FileText,
  Download,
  Upload,
  MoreVertical,
  RefreshCw,
  Menu,
  Bell,
  Settings,
  Home,
  Users,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  PlayCircle,
  Pill
} from 'lucide-react';

const ConsultationsPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedConsultations, setSelectedConsultations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock consultation data - only 2 patients
  const mockConsultations = [
    {
      id: 1,
      patient: {
        name: 'Eleanor Johnson',
        age: 78,
        gender: 'Female',
        phone: '+1 (555) 123-4567',
        email: 'eleanor.johnson@email.com',
        address: '123 Oak Street, Springfield, IL',
        bloodType: 'O+'
      },
      date: '2024-07-04',
      time: '10:30 AM',
      duration: '45 minutes',
      type: 'Video Call',
      status: 'completed',
      priority: 'medium',
      chiefComplaint: 'Follow-up for hypertension management',
      diagnosis: 'Hypertension, well controlled',
      prescription: ['Lisinopril 10mg daily', 'Amlodipine 5mg daily'],
      vitals: {
        bloodPressure: '130/85',
        heartRate: 72,
        temperature: '98.6°F',
        weight: '165 lbs'
      },
      notes: 'Patient reports feeling well. Blood pressure well controlled on current medication.',
      followUp: '3 months',
      nextOfKin: 'Sarah Johnson (Daughter)',
      nextOfKinPhone: '+1 (555) 987-6543'
    },
    {
      id: 2,
      patient: {
        name: 'Robert Smith',
        age: 82,
        gender: 'Male',
        phone: '+1 (555) 234-5678',
        email: 'robert.smith@email.com',
        address: '456 Pine Avenue, Springfield, IL',
        bloodType: 'A-'
      },
      date: '2024-07-04',
      time: '02:00 PM',
      duration: '30 minutes',
      type: 'Video Call',
      status: 'scheduled',
      priority: 'high',
      chiefComplaint: 'Chest pain and shortness of breath',
      diagnosis: 'Pending evaluation',
      prescription: [],
      vitals: {
        bloodPressure: '160/95',
        heartRate: 88,
        temperature: '99.1°F',
        weight: '180 lbs'
      },
      notes: 'Patient experiencing intermittent chest pain. Requires immediate assessment.',
      followUp: 'Pending',
      nextOfKin: 'Michael Smith (Son)',
      nextOfKinPhone: '+1 (555) 876-5432'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setConsultations(mockConsultations);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredConsultations = consultations.filter(consultation => {
    if (!consultation || !consultation.patient) return false;
    
    const patientName = consultation.patient.name || '';
    const patientEmail = consultation.patient.email || '';
    const patientPhone = consultation.patient.phone || '';
    const complaint = consultation.chiefComplaint || '';
    
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientPhone.includes(searchTerm) ||
      complaint.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'completed' && consultation.status === 'completed') ||
                         (selectedFilter === 'scheduled' && consultation.status === 'scheduled') ||
                         (selectedFilter === 'in-progress' && consultation.status === 'in-progress') ||
                         (selectedFilter === 'high-priority' && consultation.priority === 'high') ||
                         (selectedFilter === 'medium-priority' && consultation.priority === 'medium') ||
                         (selectedFilter === 'low-priority' && consultation.priority === 'low');
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectConsultation = (consultationId) => {
    setSelectedConsultations(prev => 
      prev.includes(consultationId) 
        ? prev.filter(id => id !== consultationId)
        : [...prev, consultationId]
    );
  };

  const handleSelectAll = () => {
    setSelectedConsultations(
      selectedConsultations.length === filteredConsultations.length 
        ? [] 
        : filteredConsultations.map(c => c.id)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-center h-16 bg-blue-600">
            <h2 className="text-white text-xl font-bold">ElderCare Pro</h2>
          </div>
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                <Users className="w-5 h-5 mr-3" />
                Patients
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg">
                <Stethoscope className="w-5 h-5 mr-3" />
                Consultations
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                <Calendar className="w-5 h-5 mr-3" />
                Appointments
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                <FileText className="w-5 h-5 mr-3" />
                Medical Records
              </a>
            </div>
          </nav>
        </div>

        <div className="flex-1 lg:ml-0">
          <header className="bg-white shadow-sm border-b border-gray-200 lg:static lg:overflow-y-visible">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="relative flex justify-between h-16">
                <div className="flex items-center">
                  <button
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <h1 className="ml-4 text-2xl font-semibold text-gray-900">Consultations</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-400 hover:text-gray-500">
                    <Bell className="w-6 h-6" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-500">
                    <Settings className="w-6 h-6" />
                  </button>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Dr</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading consultations...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <RoleLayout title="Consultation Management">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Consultation Management</h1>
              <p className="text-gray-600">View and manage patient consultations and video calls</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Video className="w-4 h-4" />
                Start Video Call
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4" />
                New Consultation
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Consultations */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{consultations.length}</p>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations.filter(c => c.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          {/* Scheduled */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations.filter(c => c.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          {/* High Priority */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations.filter(c => c.priority === 'high').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search consultations..."
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
                <option value="all">All Consultations</option>
                <option value="completed">Completed</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="high-priority">High Priority</option>
                <option value="medium-priority">Medium Priority</option>
                <option value="low-priority">Low Priority</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort by Date</option>
                <option value="patient">Sort by Patient</option>
                <option value="priority">Sort by Priority</option>
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

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedConsultations.length === filteredConsultations.length}
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
                    Consultation Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medical Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConsultations.map((consultation) => (
                  <tr key={consultation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedConsultations.includes(consultation.id)}
                        onChange={() => handleSelectConsultation(consultation.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {consultation.patient.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{consultation.patient.name}</div>
                          <div className="text-sm text-gray-500">{consultation.patient.age} years, {consultation.patient.gender}</div>
                          <div className="text-sm text-gray-500">Blood Type: {consultation.patient.bloodType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {consultation.patient.phone}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {consultation.patient.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {consultation.patient.address.split(',')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(consultation.status)}`}>
                          {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(consultation.priority)}`}>
                          {consultation.priority.charAt(0).toUpperCase() + consultation.priority.slice(1)} Priority
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center">
                          <Video className="w-3 h-3 mr-1" />
                          {consultation.type}
                        </div>
                        {consultation.duration && <div>Duration: {consultation.duration}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(consultation.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{consultation.time}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Next of Kin: {consultation.nextOfKin}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {consultation.chiefComplaint}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Diagnosis: {consultation.diagnosis}
                      </div>
                      {consultation.vitals && (
                        <div className="text-xs text-gray-500 mb-2">
                          <div>BP: {consultation.vitals.bloodPressure}</div>
                          <div>HR: {consultation.vitals.heartRate} bpm</div>
                          <div>Temp: {consultation.vitals.temperature}</div>
                        </div>
                      )}
                      {consultation.prescription && consultation.prescription.length > 0 && (
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center mb-1">
                            <Pill className="w-3 h-3 mr-1" />
                             Medications ({consultation.prescription.length}):
                          </div>
                          {consultation.prescription.slice(0, 2).map((med, index) => (
                            <div key={index} className="truncate">{med}</div>
                          ))}
                        </div>
                      )}
                      {consultation.followUp && (
                        <div className="text-xs text-gray-500 mt-1">
                          Follow-up: {consultation.followUp}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {consultation.status === 'scheduled' && (
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Video className="w-4 h-4" />
                          </button>
                        )}
                        {consultation.status === 'in-progress' && (
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
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

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {filteredConsultations.length} of {consultations.length} consultations
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

export default ConsultationsPage;