
// frontend/src/components/doctor/AppointmentManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Eye,
  FileText,
  Video,
  Download,
  Filter,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService } from '../../../services/appointment';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // list, details, consultation
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    loadAppointments();
  }, [filters, pagination.page]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 10,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.date && { date: filters.date }),
        ...(filters.search && { search: filters.search })
      };

      const response = await appointmentService.getDoctorAppointments(params);
      setAppointments(response.appointments || []);
      setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      toast.error('Failed to load appointments');
      console.error('Load appointments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAppointment = async (appointmentId, action, doctorNotes, rejectionReason) => {
    try {
      await appointmentService.reviewAppointment(appointmentId, action, doctorNotes, rejectionReason);
      toast.success(`Appointment ${action}d successfully`);
      loadAppointments();
      setCurrentView('list');
    } catch (error) {
      toast.error(`Failed to ${action} appointment`);
    }
  };

  const handleViewDetails = async (appointment) => {
    setSelectedAppointment(appointment);
    setCurrentView('details');
  };

  const handleStartConsultation = (appointment) => {
    setSelectedAppointment(appointment);
    setCurrentView('consultation');
  };

  const formatDate = (date) => {
    return appointmentService.formatAppointmentDate(date);
  };

  const getStatusBadge = (status) => {
    const colorClass = appointmentService.getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colorClass = appointmentService.getPriorityColor(priority);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const renderAppointmentList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Appointment Management</h1>
        <div className="flex space-x-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Start Video Call</span>
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search by patient name, reason..."
                className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center p-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Appointments Found</h3>
            <p className="text-gray-500">No appointments match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {appointment.elder?.photo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`/uploads/elders/${appointment.elder.photo}`}
                              alt={appointment.elder.firstName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.elder?.firstName} {appointment.elder?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Age: {appointment.elder?.dateOfBirth && 
                              Math.floor((new Date() - new Date(appointment.elder.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(appointment.appointmentDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.duration} minutes
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {appointment.type}
                        </span>
                        {getPriorityBadge(appointment.priority)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {appointment.reason}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(appointment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReviewAppointment(appointment.id, 'approve', 'Approved by doctor')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Please provide rejection reason:');
                                if (reason) {
                                  handleReviewAppointment(appointment.id, 'reject', '', reason);
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {appointment.status === 'approved' && (
                          <button
                            onClick={() => handleStartConsultation(appointment)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Start Consultation"
                          >
                            <Video className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                  <span className="font-medium">{pagination.pages}</span> ({pagination.total} total appointments)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAppointmentDetails = () => (
    <AppointmentDetails
      appointment={selectedAppointment}
      onBack={() => setCurrentView('list')}
      onStartConsultation={handleStartConsultation}
      onReview={handleReviewAppointment}
    />
  );

  const renderConsultation = () => (
    <ConsultationSession
      appointment={selectedAppointment}
      onBack={() => setCurrentView('details')}
      onComplete={() => {
        loadAppointments();
        setCurrentView('list');
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {currentView === 'list' && renderAppointmentList()}
        {currentView === 'details' && renderAppointmentDetails()}
        {currentView === 'consultation' && renderConsultation()}
      </div>
    </div>
  );
};

// Appointment Details Component
const AppointmentDetails = ({ appointment, onBack, onStartConsultation, onReview }) => {
  const [elderSummary, setElderSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appointment?.elderId) {
      loadElderSummary();
    }
  }, [appointment]);

  const loadElderSummary = async () => {
    try {
      const response = await appointmentService.getElderMedicalSummary(appointment.elderId);
      setElderSummary(response.elderSummary);
    } catch (error) {
      toast.error('Failed to load elder summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          ← Back to Appointments
        </button>
        <div className="flex space-x-4">
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => onReview(appointment.id, 'approve', 'Approved by doctor')}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Approve Appointment
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Please provide rejection reason:');
                  if (reason) {
                    onReview(appointment.id, 'reject', '', reason);
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Reject Appointment
              </button>
            </>
          )}
          {appointment.status === 'approved' && (
            <button
              onClick={() => onStartConsultation(appointment)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
            >
              <Video className="w-4 h-4" />
              <span>Start Consultation</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Information */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Appointment Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Date & Time</label>
              <p className="text-lg">{appointmentService.formatAppointmentDate(appointment.appointmentDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Duration</label>
              <p>{appointment.duration} minutes</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Type</label>
              <p className="capitalize">{appointment.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Priority</label>
              <div className="mt-1">
                {appointmentService.getPriorityColor(appointment.priority) && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointmentService.getPriorityColor(appointment.priority)}`}>
                    {appointment.priority.charAt(0).toUpperCase() + appointment.priority.slice(1)}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Reason</label>
              <p>{appointment.reason}</p>
            </div>
            {appointment.symptoms && (
              <div>
                <label className="text-sm font-medium text-gray-600">Symptoms</label>
                <p>{appointment.symptoms}</p>
              </div>
            )}
            {appointment.notes && (
              <div>
                <label className="text-sm font-medium text-gray-600">Family Notes</label>
                <p>{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Elder Information */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Elder Information</h2>
          {elderSummary && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {elderSummary.personalInfo.photo ? (
                  <img
                    src={`/uploads/elders/${elderSummary.personalInfo.photo}`}
                    alt={elderSummary.personalInfo.firstName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {elderSummary.personalInfo.firstName} {elderSummary.personalInfo.lastName}
                  </h3>
                  <p className="text-gray-600">Age: {elderSummary.personalInfo.age}</p>
                  <p className="text-gray-600 capitalize">{elderSummary.personalInfo.gender}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-600">Blood Type</label>
                  <p>{elderSummary.personalInfo.bloodType || 'Not specified'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Phone</label>
                  <p>{elderSummary.personalInfo.phone}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Emergency Contact</label>
                  <p>{elderSummary.personalInfo.emergencyContact}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Insurance</label>
                  <p>{elderSummary.medicalInfo.insuranceProvider || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Medical Summary */}
      {elderSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Medical Info */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Current Medical Information</h2>
            <div className="space-y-4">
              {elderSummary.medicalInfo.allergies && (
                <div>
                  <label className="text-sm font-medium text-red-600">Allergies</label>
                  <p className="text-red-700 bg-red-50 p-2 rounded">{elderSummary.medicalInfo.allergies}</p>
                </div>
              )}
              {elderSummary.medicalInfo.chronicConditions && (
                <div>
                  <label className="text-sm font-medium text-orange-600">Chronic Conditions</label>
                  <p className="text-orange-700 bg-orange-50 p-2 rounded">{elderSummary.medicalInfo.chronicConditions}</p>
                </div>
              )}
              {elderSummary.medicalInfo.currentMedications && (
                <div>
                  <label className="text-sm font-medium text-blue-600">Current Medications</label>
                  <p className="text-blue-700 bg-blue-50 p-2 rounded">{elderSummary.medicalInfo.currentMedications}</p>
                </div>
              )}
              {elderSummary.medicalInfo.medicalHistory && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Medical History</label>
                  <p className="text-gray-700 bg-gray-50 p-2 rounded">{elderSummary.medicalInfo.medicalHistory}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Consultations */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Recent Consultations</h2>
            {elderSummary.recentConsultations && elderSummary.recentConsultations.length > 0 ? (
              <div className="space-y-3">
                {elderSummary.recentConsultations.slice(0, 5).map((consultation, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">
                          {consultation.diagnosis || 'General consultation'}
                        </p>
                        <p className="text-xs text-gray-600">
                          Dr. {consultation.doctor?.user?.firstName} {consultation.doctor?.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(consultation.sessionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent consultations</p>
            )}
          </div>
        </div>
      )}

      {/* Family Member Contact */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Family Member Contact</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <p className="font-medium">
              {appointment.familyMember?.firstName} {appointment.familyMember?.lastName}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{appointment.familyMember?.email}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>{appointment.familyMember?.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Consultation Session Component
const ConsultationSession = ({ appointment, onBack, onComplete }) => {
  const [consultationData, setConsultationData] = useState({
    diagnosis: '',
    treatment: '',
    recommendations: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      oxygenSaturation: ''
    },
    symptoms: '',
    sessionSummary: '',
    followUpRequired: false,
    followUpDate: '',
    actualDuration: appointment.duration
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAddMedication = () => {
    if (newMedication.name && newMedication.dosage && newMedication.frequency) {
      setPrescriptions([...prescriptions, { ...newMedication }]);
      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
    }
  };

  const handleRemoveMedication = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleCompleteConsultation = async () => {
    try {
      setLoading(true);

      if (!consultationData.sessionSummary.trim()) {
        toast.error('Session summary is required');
        return;
      }

      // Complete the appointment
      const response = await appointmentService.completeAppointment(
        appointment.id,
        consultationData
      );

      // Create prescription if medications were added
      if (prescriptions.length > 0) {
        await appointmentService.createPrescription(
          response.consultationRecord.id,
          {
            medications: prescriptions,
            instructions: 'Please follow the prescribed medication schedule',
            validUntil: consultationData.followUpDate || null
          }
        );
      }

      toast.success('Consultation completed successfully');
      onComplete();
    } catch (error) {
      toast.error('Failed to complete consultation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          ← Back to Details
        </button>
        <h1 className="text-2xl font-bold">
          Consultation: {appointment.elder?.firstName} {appointment.elder?.lastName}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultation Notes */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Consultation Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis
                </label>
                <textarea
                  value={consultationData.diagnosis}
                  onChange={(e) => setConsultationData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter diagnosis..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treatment Plan
                </label>
                <textarea
                  value={consultationData.treatment}
                  onChange={(e) => setConsultationData(prev => ({ ...prev, treatment: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter treatment plan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendations
                </label>
                <textarea
                  value={consultationData.recommendations}
                  onChange={(e) => setConsultationData(prev => ({ ...prev, recommendations: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter recommendations..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Summary *
                </label>
                <textarea
                  value={consultationData.sessionSummary}
                  onChange={(e) => setConsultationData(prev => ({ ...prev, sessionSummary: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide a comprehensive summary of the consultation..."
                  required
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={consultationData.followUpRequired}
                    onChange={(e) => setConsultationData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm">Follow-up required</span>
                </label>
                {consultationData.followUpRequired && (
                  <input
                    type="date"
                    value={consultationData.followUpDate}
                    onChange={(e) => setConsultationData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="p-2 border border-gray-300 rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Vital Signs</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  value={consultationData.vitalSigns.bloodPressure}
                  onChange={(e) => setConsultationData(prev => ({
                    ...prev,
                    vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value }
                  }))}
                  placeholder="120/80"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={consultationData.vitalSigns.heartRate}
                  onChange={(e) => setConsultationData(prev => ({
                    ...prev,
                    vitalSigns: { ...prev.vitalSigns, heartRate: e.target.value }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={consultationData.vitalSigns.temperature}
                  onChange={(e) => setConsultationData(prev => ({
                    ...prev,
                    vitalSigns: { ...prev.vitalSigns, temperature: e.target.value }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  value={consultationData.vitalSigns.weight}
                  onChange={(e) => setConsultationData(prev => ({
                    ...prev,
                    vitalSigns: { ...prev.vitalSigns, weight: e.target.value }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  O2 Saturation (%)
                </label>
                <input
                  type="number"
                  min="70"
                  max="100"
                  value={consultationData.vitalSigns.oxygenSaturation}
                  onChange={(e) => setConsultationData(prev => ({
                    ...prev,
                    vitalSigns: { ...prev.vitalSigns, oxygenSaturation: e.target.value }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Management */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Prescription</h2>
            
            {/* Add New Medication */}
            <div className="space-y-4 mb-6">
              <h3 className="font-medium">Add Medication</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Medication name"
                  className="p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="Dosage (e.g., 10mg)"
                  className="p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                  placeholder="Frequency (e.g., 2x daily)"
                  className="p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={newMedication.duration}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="Duration (e.g., 7 days)"
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <textarea
                value={newMedication.instructions}
                onChange={(e) => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Special instructions..."
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleAddMedication}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Add Medication
              </button>
            </div>

            {/* Prescription List */}
            {prescriptions.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Prescribed Medications</h3>
                <div className="space-y-3">
                  {prescriptions.map((med, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{med.name}</h4>
                          <p className="text-sm text-gray-600">
                            {med.dosage} - {med.frequency} for {med.duration}
                          </p>
                          {med.instructions && (
                            <p className="text-sm text-gray-500 mt-1">{med.instructions}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveMedication(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Zoom Meeting Info */}
          {appointment.zoomJoinUrl && (
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Video Call Information</h3>
              <div className="space-y-2 text-sm">
                <p className="text-blue-800">
                  <strong>Join URL:</strong>{' '}
                  <a
                    href={appointment.zoomJoinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-900"
                  >
                    Start Video Call
                  </a>
                </p>
                {appointment.zoomPassword && (
                  <p className="text-blue-800">
                    <strong>Password:</strong> {appointment.zoomPassword}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Consultation Button */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-end space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCompleteConsultation}
            disabled={loading || !consultationData.sessionSummary.trim()}
            className={`px-8 py-3 rounded-lg font-medium ${
              loading || !consultationData.sessionSummary.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Completing...</span>
              </div>
            ) : (
              'Complete Consultation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManagement;