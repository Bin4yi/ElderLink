// frontend/src/components/family/sessions/AutoScheduleMonthly.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  Loader,
  CalendarCheck,
  UserCircle,
  Stethoscope,
  PlayCircle,
  ArrowRight,
  Shield,
  Info,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import monthlySessionService from '../../../services/monthlySession';
import { elderService } from '../../../services/elder';
import { doctorAssignmentService } from '../../../services/doctorAssignment';

// Helper function to get full photo URL
const getPhotoUrl = (photo) => {
  if (!photo) return null;
  // If photo is already a full URL, return it
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  // Otherwise, construct the URL from the backend
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${API_URL}/uploads/${photo}`;
};

const AutoScheduleMonthly = ({ onComplete }) => {
  const navigate = useNavigate();
  const [elders, setElders] = useState([]);
  const [selectedElder, setSelectedElder] = useState(null);
  const [selectedElderData, setSelectedElderData] = useState(null);
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [existingSession, setExistingSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(false);
  const [formData, setFormData] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    sessionTime: '10:00'
  });

  // Calculate max months based on subscription duration
  const getMaxMonths = () => {
    if (!selectedElderData?.subscription?.duration) return 12;
    
    const duration = selectedElderData.subscription.duration;
    switch (duration) {
      case '1_month': return 1;
      case '6_months': return 6;
      case '1_year': return 12;
      default: return 12;
    }
  };

  const maxMonths = getMaxMonths();

  useEffect(() => {
    console.log('🚀 Component mounted, loading elders...');
    console.log('🔑 Auth token exists:', !!localStorage.getItem('token'));
    loadElders();
  }, []);

  useEffect(() => {
    if (selectedElder) {
      const elderData = elders.find(e => e.id === selectedElder);
      setSelectedElderData(elderData);
      loadAssignedDoctor();
      // checkExistingSession will be called by the other useEffect when formData.sessionDate changes
    }
  }, [selectedElder, elders]);

  const loadElders = async () => {
    try {
      setLoading(true);
      console.log('🔍 Starting to load elders...');
      
      const response = await elderService.getElders();
      console.log('📋 Full elders response:', JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        const elderList = response.elders || [];
        console.log('✅ Successfully loaded elders:', elderList.length);
        console.log('📋 Elders data:', elderList);
        setElders(elderList);
        
        if (elderList.length === 0) {
          toast.info('No elders found. Please add an elder first.');
        }
      } else if (response && Array.isArray(response.elders)) {
        // Handle direct array response
        console.log('✅ Setting elders from direct array:', response.elders.length);
        setElders(response.elders);
      } else {
        console.warn('⚠️ Unexpected response structure:', response);
        setElders([]);
        toast.warning('No elders found. Please add an elder first.');
      }
    } catch (error) {
      console.error('❌ Error loading elders:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Please check your permissions.');
      } else {
        toast.error('Failed to load elders. Please try again.');
      }
      setElders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedDoctor = async () => {
    try {
      console.log('🔍 Loading doctor for elder:', selectedElder);
      
      // Use getElderDoctorAssignments to get the assigned doctor
      const response = await doctorAssignmentService.getElderDoctorAssignments(selectedElder);
      console.log('👨‍⚕️ Doctor assignment response:', response);
      console.log('👨‍⚕️ Response data:', JSON.stringify(response.data, null, 2));
      
      if (response.success && response.data && response.data.length > 0) {
        // The backend now returns DoctorAssignment objects with included doctor
        const assignment = response.data[0]; // Get the first (latest) assignment
        console.log('📋 Assignment object:', assignment);
        
        // The doctor info is in the 'doctor' field (lowercase from backend)
        const doctor = assignment.doctor || assignment.Doctor;
        
        if (doctor) {
          setAssignedDoctor(doctor);
          console.log('✅ Assigned doctor:', doctor);
          toast.success(`Doctor ${doctor.firstName} ${doctor.lastName} assigned`);
        } else {
          console.warn('⚠️ No doctor found in assignment:', assignment);
          setAssignedDoctor(null);
          toast.error('No active doctor assigned to this elder. Please assign a doctor first.');
        }
      } else {
        console.warn('⚠️ No assignments found or invalid response');
        setAssignedDoctor(null);
        toast.error('No doctor assigned to this elder. Please assign a doctor first.');
      }
    } catch (error) {
      console.error('❌ Error loading assigned doctor:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setAssignedDoctor(null);
      toast.error('Failed to load assigned doctor');
    }
  };

  const checkExistingSession = async () => {
    if (!selectedElder || !formData.sessionDate) return;

    try {
      setCheckingSession(true);
      const selectedDate = new Date(formData.sessionDate);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1; // JavaScript months are 0-indexed
      
      console.log('🔍 Checking for existing session:', { 
        elderId: selectedElder, 
        year, 
        month,
        selectedDate: formData.sessionDate 
      });
      
      // Check if a session already exists for this specific month
      const response = await monthlySessionService.checkMonthlySessionExists(
        selectedElder,
        year,
        month
      );
      
      console.log('📋 Check response:', response);
      
      if (response.success && response.exists) {
        const session = response.session;
        console.log('⚠️ Found existing session for this month:', session);
        console.log(`   Existing: ${new Date(session.sessionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
        console.log(`   Selected: ${new Date(formData.sessionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
        
        setExistingSession(session);
        
        toast.error(`You Already Created Session for ${new Date(formData.sessionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}! For additional sessions, please book a regular appointment with payment.`, {
          duration: 8000,
          icon: '⚠️'
        });
      } else {
        console.log(`✅ No existing session found for ${new Date(formData.sessionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - You can create a session!`);
        setExistingSession(null);
      }
    } catch (error) {
      console.error('❌ Error checking session:', error);
      setExistingSession(null);
    } finally {
      setCheckingSession(false);
    }
  };

  // Check for existing session whenever the date changes
  useEffect(() => {
    if (selectedElder && formData.sessionDate) {
      checkExistingSession();
    }
  }, [selectedElder, formData.sessionDate]);

  const resetForm = () => {
    setExistingSession(null);
    // Keep current date as default
    setFormData({
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTime: '10:00'
    });
  };

  const handleCreateSession = async () => {
    if (!selectedElder) {
      toast.error('Please select an elder');
      return;
    }

    if (!assignedDoctor) {
      toast.error('No doctor assigned to this elder');
      return;
    }

    if (!formData.sessionDate || !formData.sessionTime) {
      toast.error('Please set session date and time');
      return;
    }

    // Check if session already exists for this month before creating
    if (existingSession) {
      toast.error('You Already Created Session for This Month! For additional sessions, please book a regular appointment with payment.', {
        duration: 6000,
        icon: '⚠️'
      });
      return;
    }

    try {
      setCreating(true);
      
      // Create new monthly session
      console.log('📤 Creating monthly session:', {
        elderId: selectedElder,
        doctorId: assignedDoctor.id,
        sessionDate: formData.sessionDate,
        sessionTime: formData.sessionTime
      });

      const response = await monthlySessionService.createFirstMonthlySession({
        elderId: selectedElder,
        doctorId: assignedDoctor.id,
        sessionDate: formData.sessionDate,
        sessionTime: formData.sessionTime
      });

      console.log('📥 Response:', response);

      if (response.success) {
        toast.success('Monthly session created successfully! This is your free monthly health check-up.', {
          duration: 4000,
          icon: '✅'
        });
        
        // Redirect to sessions list
        setTimeout(() => {
          navigate('/family/sessions');
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Error creating session:', error);
      
      // Check if error is about existing session
      if (error.message && error.message.includes('Already Created Session')) {
        toast.error('You Already Created Session for This Month! For additional sessions, please book a regular appointment with payment.', {
          duration: 6000,
          icon: '⚠️'
        });
      } else {
        const errorMessage = error.message || 'Failed to create monthly session';
        toast.error(errorMessage, { duration: 5000 });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleReset = () => {
    setSelectedElder(null);
    setSelectedElderData(null);
    setAssignedDoctor(null);
    setFormData({
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTime: '10:00'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading elders...</p>
        </div>
      </div>
    );
  }

  // Debug: Log elders before rendering
  console.log('🎨 Rendering with elders:', elders);
  console.log('🎨 Elders count:', elders.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Modern Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/family/sessions')}
            className="group flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Sessions</span>
          </button>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                  <div className="relative p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                    <CalendarCheck className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Create Monthly Health Check-up
                  </h1>
                  <p className="text-gray-600 text-lg">Schedule personalized health sessions with care and ease</p>
                </div>
              </div>
            </div>

            {/* Modern Progress Steps */}
            <div className="mt-8 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-200/50 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Easy 3-Step Process</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="group flex items-center space-x-3 bg-white/70 hover:bg-white rounded-xl p-4 border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg cursor-pointer">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                        1
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Select Elder</span>
                    </div>
                    <div className="group flex items-center space-x-3 bg-white/70 hover:bg-white rounded-xl p-4 border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg cursor-pointer">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                        2
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Verify Doctor</span>
                    </div>
                    <div className="group flex items-center space-x-3 bg-white/70 hover:bg-white rounded-xl p-4 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg cursor-pointer">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                        3
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Set Date & Time</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-gray-600 flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Sessions are created instantly and synced in real-time</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      {!creating && (
        <>
          {/* Step 1: Select Elder - Modern Design */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-6 border border-white/20 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl blur opacity-40"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                    1
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Select Elder
                  </h2>
                  <p className="text-sm text-gray-500">Choose who you want to schedule for</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                <span className="text-sm font-semibold text-blue-700">{elders.length} {elders.length === 1 ? 'Elder' : 'Elders'} Available</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {elders.map(elder => {
                const photoUrl = getPhotoUrl(elder.photo);
                const elderName = `${elder.firstName || ''} ${elder.lastName || ''}`.trim() || 'Unknown';
                const age = elder.dateOfBirth 
                  ? new Date().getFullYear() - new Date(elder.dateOfBirth).getFullYear() 
                  : 'N/A';
                
                console.log('👴 Rendering elder:', elderName, 'Photo:', photoUrl);
                
                return (
                  <div
                    key={elder.id}
                    onClick={() => setSelectedElder(elder.id)}
                    className={`group cursor-pointer relative overflow-hidden rounded-2xl p-5 transition-all duration-300 transform hover:scale-105 ${
                      selectedElder === elder.id
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/50'
                        : 'bg-white hover:shadow-xl border-2 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="relative flex items-center space-x-4">
                      <div className="relative">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={elderName}
                            className={`relative w-16 h-16 rounded-full object-cover border-4 ${
                              selectedElder === elder.id ? 'border-white' : 'border-gray-200'
                            } shadow-lg`}
                            onError={(e) => {
                              console.error('Failed to load image:', photoUrl);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`relative w-16 h-16 ${selectedElder === elder.id ? 'bg-white/20' : 'bg-gradient-to-br from-gray-100 to-gray-200'} rounded-full flex items-center justify-center border-4 ${selectedElder === elder.id ? 'border-white' : 'border-gray-200'} shadow-lg ${photoUrl ? 'hidden' : ''}`}>
                          <UserCircle className={`w-10 h-10 ${selectedElder === elder.id ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-lg ${selectedElder === elder.id ? 'text-white' : 'text-gray-900'}`}>
                          {elderName}
                        </p>
                        <p className={`text-sm ${selectedElder === elder.id ? 'text-white/80' : 'text-gray-600'} flex items-center space-x-1`}>
                          <User className="w-4 h-4" />
                          <span>{age} years old</span>
                        </p>
                        {elder.subscription?.plan && (
                          <div className={`inline-flex items-center px-2.5 py-1 mt-2 rounded-full text-xs font-semibold ${
                            selectedElder === elder.id
                              ? 'bg-white/20 text-white'
                              : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                          }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {elder.subscription.plan.charAt(0).toUpperCase() + elder.subscription.plan.slice(1)} Plan
                          </div>
                        )}
                      </div>
                      {selectedElder === elder.id && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {elders.length === 0 && (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-2xl opacity-20"></div>
                  <div className="relative p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                    <UserCircle className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Elders Found</h3>
                <p className="text-gray-500 mb-6">Add an elder to your family to get started</p>
                <button
                  onClick={() => navigate('/family/elders/add')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Add Elder Now
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Review Assigned Doctor - Modern Design */}
          {selectedElder && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-6 border border-white/20 hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-40"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                    2
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Assigned Family Doctor
                  </h2>
                  <p className="text-sm text-gray-500">Verify the healthcare professional</p>
                </div>
              </div>

              {assignedDoctor ? (
                <div className="border border-green-200 bg-green-50 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Stethoscope className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Dr. {assignedDoctor.firstName} {assignedDoctor.lastName}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Specialization</p>
                          <p className="font-medium text-gray-900">{assignedDoctor.specialization || 'General Medicine'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Experience</p>
                          <p className="font-medium text-gray-900">{assignedDoctor.experience || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{assignedDoctor.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{assignedDoctor.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">
                          Active Assignment
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <p className="text-red-800 font-medium mb-2">No Doctor Assigned</p>
                  <p className="text-sm text-red-700">Please assign a family doctor to this elder before scheduling monthly sessions.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Date and Time */}
          {selectedElder && assignedDoctor && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Select Date and Time</h2>
              </div>

              {/* Existing Session Warning */}
              {existingSession && (
                <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-amber-900 font-bold text-lg mb-2">
                        ⚠️ You Already Created First Session
                      </h3>
                      <p className="text-amber-800 text-base mb-3 font-medium">
                        A monthly session for <strong>{selectedElderData?.firstName} {selectedElderData?.lastName}</strong> with <strong>Dr. {assignedDoctor?.firstName} {assignedDoctor?.lastName}</strong> already exists.
                      </p>
                      <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 mb-3">
                        <p className="text-amber-900 font-bold text-center text-sm">
                          🚫 You cannot create a duplicate session. You can only view or update the existing one.
                        </p>
                      </div>
                      <div className="bg-white rounded p-3 mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            <span className="font-medium text-gray-900">
                              {new Date(existingSession.sessionDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span className="font-medium text-gray-900">{existingSession.sessionTime}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-amber-700 text-xs mt-2">
                        💡 You can view this session on the Monthly Sessions page or modify the date/time below and update it.
                      </p>
                      <div className="mt-3">
                        <button
                          onClick={() => navigate('/family/sessions')}
                          className="text-sm text-amber-700 hover:text-amber-900 font-medium underline"
                        >
                          View in Monthly Sessions →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {checkingSession && (
                <div className="mb-4 text-center text-gray-600 text-sm">
                  <Loader className="w-4 h-4 animate-spin inline mr-2" />
                  Checking for existing sessions...
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Session Date
                  </label>
                  <input
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      existingSession ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {existingSession ? (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      ⚠️ Session already exists for {new Date(formData.sessionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Choose any month - you can create one free session per month</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Session Time
                  </label>
                  <select
                    value={formData.sessionTime}
                    onChange={(e) => setFormData({ ...formData, sessionTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="08:00">08:00 AM</option>
                    <option value="08:30">08:30 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="09:30">09:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="12:30">12:30 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="13:30">01:30 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="16:30">04:30 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="17:30">05:30 PM</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Choose session time</p>
                </div>
              </div>

              {formData.sessionDate && formData.sessionTime && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <CalendarCheck className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Your Scheduled First Session</p>
                      <p className="text-sm text-gray-600">
                        {new Date(formData.sessionDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })} at {formData.sessionTime}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Create Session Button */}
          {selectedElder && assignedDoctor && formData.sessionDate && formData.sessionTime && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              {/* Existing Session Warning with Book Appointment CTA */}
              {existingSession && (
                <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-amber-900 mb-2">
                        Monthly Session Already Exists
                      </h3>
                      <p className="text-sm text-amber-800 mb-3">
                        You've already created your <span className="font-semibold">free monthly session</span> for{' '}
                        <span className="font-bold">{new Date(formData.sessionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>.
                      </p>
                      <div className="bg-white/70 rounded-lg p-4 mb-4 border border-amber-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">📋 System Rules:</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span><strong>One free session</strong> per elder per month (included in your plan)</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-red-600 mr-2">✗</span>
                            <span>Cannot create multiple sessions in the same month</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">→</span>
                            <span>For additional sessions, please book a <strong>regular appointment</strong></span>
                          </li>
                        </ul>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => navigate('/family/appointments/book')}
                          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          <Calendar className="w-5 h-5" />
                          <span>Book Regular Appointment</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Change to a different month (next month)
                            const currentDate = new Date(formData.sessionDate);
                            const nextMonth = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
                            setFormData({ ...formData, sessionDate: nextMonth.toISOString().split('T')[0] });
                          }}
                          className="flex items-center space-x-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Try Next Month</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {existingSession ? '⚠️ Session Already Exists' : '✅ Ready to Create Session'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(formData.sessionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} 
                      {' '}- {formData.sessionTime}
                    </p>
                    {existingSession && (
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        Select a different month or book a paid appointment above
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleCreateSession}
                  disabled={creating || checkingSession || existingSession}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                    existingSession
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : creating || checkingSession
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl transform hover:scale-105'
                  }`}
                  title={existingSession ? 'Session already exists for this month' : 'Create monthly session'}
                >
                  {creating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Creating Session...</span>
                    </>
                  ) : checkingSession ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : existingSession ? (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      <span>Month Already Booked</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5" />
                      <span>Create Free Monthly Session</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

// Helper function to get day suffix (1st, 2nd, 3rd, etc.)
const getDaySuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export default AutoScheduleMonthly;
