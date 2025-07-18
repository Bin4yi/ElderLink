// src/components/doctor/records/RecordList.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import NewRecordForm from './NewRecordForm';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  FileText,
  Heart,
  Activity,
  Stethoscope,
  Calendar,
  Clock,
  User,
  AlertCircle,
  MoreVertical,
  Printer,
  Share2,
  Archive
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const RecordList = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);
  const { user } = useAuth();

  // Mock data - replace with actual API calls
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual medical records service
      setTimeout(() => {
        const mockRecords = [
          {
            id: 1,
            recordNumber: 'MR-2025-001',
            patientName: 'Eleanor Johnson',
            patientId: 'P-001',
            recordType: 'Consultation',
            category: 'Cardiology',
            date: '2025-01-15',
            lastUpdated: '2025-01-15T10:30:00',
            doctor: 'Dr. Smith',
            diagnosis: 'Hypertension monitoring',
            status: 'active',
            priority: 'high',
            attachments: 3,
            notes: 'Regular follow-up required',
            vitalSigns: {
              bloodPressure: '140/90',
              heartRate: '82 bpm',
              temperature: '98.6°F',
              weight: '165 lbs'
            }
          },
          {
            id: 2,
            recordNumber: 'MR-2025-002',
            patientName: 'Robert Smith',
            patientId: 'P-002',
            recordType: 'Lab Results',
            category: 'Endocrinology',
            date: '2025-01-14',
            lastUpdated: '2025-01-14T14:20:00',
            doctor: 'Dr. Johnson',
            diagnosis: 'Diabetes Type 2',
            status: 'completed',
            priority: 'normal',
            attachments: 5,
            notes: 'Blood glucose levels stable',
            vitalSigns: {
              bloodPressure: '125/80',
              heartRate: '75 bpm',
              temperature: '98.4°F',
              weight: '180 lbs'
            }
          },
          {
            id: 3,
            recordNumber: 'MR-2025-003',
            patientName: 'Mary Wilson',
            patientId: 'P-003',
            recordType: 'Treatment Plan',
            category: 'Cardiology',
            date: '2025-01-13',
            lastUpdated: '2025-01-13T16:45:00',
            doctor: 'Dr. Brown',
            diagnosis: 'Heart arrhythmia',
            status: 'pending',
            priority: 'high',
            attachments: 2,
            notes: 'Monitoring required, medication adjustment needed',
            vitalSigns: {
              bloodPressure: '150/95',
              heartRate: '95 bpm',
              temperature: '98.8°F',
              weight: '140 lbs'
            }
          },
          {
            id: 4,
            recordNumber: 'MR-2025-004',
            patientName: 'James Brown',
            patientId: 'P-004',
            recordType: 'Prescription',
            category: 'General Medicine',
            date: '2025-01-12',
            lastUpdated: '2025-01-12T09:15:00',
            doctor: 'Dr. Davis',
            diagnosis: 'Hypertension',
            status: 'active',
            priority: 'normal',
            attachments: 1,
            notes: 'Medication refill approved',
            vitalSigns: {
              bloodPressure: '130/85',
              heartRate: '78 bpm',
              temperature: '98.5°F',
              weight: '175 lbs'
            }
          },
          {
            id: 5,
            recordNumber: 'MR-2025-005',
            patientName: 'Sarah Davis',
            patientId: 'P-005',
            recordType: 'Emergency',
            category: 'Emergency Medicine',
            date: '2025-01-11',
            lastUpdated: '2025-01-11T20:30:00',
            doctor: 'Dr. Wilson',
            diagnosis: 'Chest pain evaluation',
            status: 'completed',
            priority: 'urgent',
            attachments: 7,
            notes: 'Ruled out cardiac event, muscle strain diagnosed',
            vitalSigns: {
              bloodPressure: '145/92',
              heartRate: '88 bpm',
              temperature: '99.1°F',
              weight: '155 lbs'
            }
          }
        ];
        setRecords(mockRecords);
        setFilteredRecords(mockRecords);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load medical records:', error);
      toast.error('Failed to load medical records');
      setLoading(false);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = records;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.recordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.recordType === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredRecords(filtered);
  }, [records, searchTerm, filterStatus, filterType, sortField, sortOrder]);

  const handleSelectRecord = (recordId) => {
    setSelectedRecords(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map(record => record.id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewRecordSuccess = () => {
    // Reload records after successful creation
    loadRecords();
    toast.success('Medical record created successfully!');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'normal':
        return 'text-green-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRecordTypeIcon = (type) => {
    switch (type) {
      case 'Consultation':
        return <Stethoscope className="w-4 h-4" />;
      case 'Lab Results':
        return <Activity className="w-4 h-4" />;
      case 'Treatment Plan':
        return <Heart className="w-4 h-4" />;
      case 'Prescription':
        return <FileText className="w-4 h-4" />;
      case 'Emergency':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <RoleLayout title="Medical Records">
        <Loading text="Loading medical records..." />
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="Medical Records">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Medical Records</h1>
              <p className="text-purple-100">
                Manage and review patient medical records, treatment history, and health documentation
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Record</span>
              </button>
              <button 
                className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors flex items-center space-x-2"
                onClick={() => setShowNewRecordForm(true)}
              >
                <Plus className="w-4 h-4" />
                <span>New Record</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{records.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Records</p>
                <p className="text-2xl font-bold text-gray-900">
                  {records.filter(r => r.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {records.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {records.filter(r => r.priority === 'high' || r.priority === 'urgent').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search records, patients, diagnosis..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Consultation">Consultation</option>
                <option value="Lab Results">Lab Results</option>
                <option value="Treatment Plan">Treatment Plan</option>
                <option value="Prescription">Prescription</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              {selectedRecords.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedRecords.length} selected
                  </span>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Archive className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <span>Sort:</span>
                <button
                  className="px-2 py-1 hover:bg-gray-50 rounded"
                  onClick={() => setSortField('date')}
                >
                  Date
                </button>
                <button
                  className="px-2 py-1 hover:bg-gray-50 rounded"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRecords.length === filteredRecords.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vital Signs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRecords.includes(record.id)}
                        onChange={() => handleSelectRecord(record.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-lg ${
                            record.priority === 'urgent' ? 'bg-red-100' :
                            record.priority === 'high' ? 'bg-orange-100' :
                            'bg-blue-100'
                          }`}>
                            {getRecordTypeIcon(record.recordType)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.recordNumber}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {record.diagnosis}
                          </div>
                          {record.attachments > 0 && (
                            <div className="text-xs text-blue-600 flex items-center mt-1">
                              <FileText className="w-3 h-3 mr-1" />
                              {record.attachments} attachment{record.attachments > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {record.patientId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.recordType}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        <div className={`text-xs font-medium ${getPriorityColor(record.priority)}`}>
                          {record.priority} priority
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.doctor}
                        </div>
                        <div className="text-xs text-gray-400">
                          Updated: {new Date(record.lastUpdated).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center text-gray-600">
                          <Heart className="w-3 h-3 mr-1 text-red-500" />
                          {record.vitalSigns.bloodPressure}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Activity className="w-3 h-3 mr-1 text-green-500" />
                          {record.vitalSigns.heartRate}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.vitalSigns.temperature} | {record.vitalSigns.weight}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Record"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Record"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="More Actions"
                        >
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
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {filteredRecords.length} of {records.length} records
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 bg-purple-600 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredRecords.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Start by creating your first medical record.'}
            </p>
            <button 
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
              onClick={() => setShowNewRecordForm(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Create New Record</span>
            </button>
          </div>
        )}

        {/* New Record Form Modal */}
        <NewRecordForm
          isOpen={showNewRecordForm}
          onClose={() => setShowNewRecordForm(false)}
          onSuccess={handleNewRecordSuccess}
        />
      </div>
    </RoleLayout>
  );
};

export default RecordList;