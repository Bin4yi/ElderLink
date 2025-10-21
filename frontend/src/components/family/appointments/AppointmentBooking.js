// frontend/src/components/appointments/AppointmentBooking.js
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import RoleLayout from '../../common/RoleLayout'; 

import DoctorCalendarModal from './DoctorCalendarModal';
import AppointmentPaymentForm from './AppointmentPaymentForm';
import { appointmentService } from '../../../services/appointment';
import { elderService } from '../../../services/elder';
import { useNavigate, useLocation } from 'react-router-dom';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');


const AppointmentBooking = ({ onBack, onSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [selectedElder, setSelectedElder] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentDetails, setAppointmentDetails] = useState({
    type: 'consultation',
    priority: 'medium',
    reason: '',
    symptoms: '',
    notes: ''
  });
  const [medicalRecordAccess, setMedicalRecordAccess] = useState({
    allowAccess: false,
    notes: ''
  });
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);

  const [elders, setElders] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Load initial data
  useEffect(() => {
    loadElders();
    loadDoctors();
  }, []);

  // Handle pre-selected data from navigation state
  useEffect(() => {
    if (location.state) {
      const { preSelectedElder, preSelectedDoctor, fromMonthlySession } = location.state;
      
      if (preSelectedElder) {
        setSelectedElder(preSelectedElder);
        console.log('✅ Pre-selected elder:', preSelectedElder);
      }
      
      if (preSelectedDoctor) {
        setSelectedDoctor(preSelectedDoctor);
        console.log('✅ Pre-selected doctor:', preSelectedDoctor);
      }

      if (fromMonthlySession) {
        toast.success('Elder and Doctor pre-selected from Monthly Session', {
          icon: '📋',
          duration: 4000
        });
      }
    }
  }, [location.state]);

  // Countdown timer effect
  useEffect(() => {
    if (reservation && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleReservationExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [reservation, remainingTime]);

  const handleReservationExpired = async () => {
    toast.error('Your reservation has expired. Please select a new time slot.');
    if (reservation) {
      try {
        await appointmentService.cancelReservation(reservation.id);
      } catch (error) {
        console.error('Error cancelling expired reservation:', error);
      }
    }
    setReservation(null);
    setStep(2);
    setSelectedDate('');
    setSelectedTime('');
  };

  const loadElders = async () => {
    try {
      const response = await elderService.getElders();
      setElders(response.elders || []);
    } catch (error) {
      toast.error('Failed to load elders');
    }
  };

  const loadDoctors = async () => {
    try {
      console.log('🔄 Loading doctors...');
      const response = await appointmentService.getAvailableDoctors();
      console.log('✅ Doctors API response:', response);

      // Try both possible response shapes
      let doctors = [];
      if (response.doctors) {
        doctors = response.doctors;
      } else if (response.data && response.data.doctors) {
        doctors = response.data.doctors;
      } else if (response.data && Array.isArray(response.data)) {
        doctors = response.data;
      }
      setDoctors(doctors);
      console.log(`✅ Set ${doctors.length} doctors`);
    } catch (error) {
      console.error('❌ Error loading doctors:', error);
      toast.error(`Failed to load doctors: ${error.message}`);
      setDoctors([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setShowCalendarModal(true);
  };

  const handleSlotSelect = async (date, time) => {
    setLoading(true);
    try {
      // Create appointment datetime
      const appointmentDateTime = `${date}T${time}:00`;
      
      // Reserve the time slot
      const reservationResponse = await appointmentService.reserveTimeSlot(
        selectedDoctor.id,
        appointmentDateTime
      );
      
      if (reservationResponse.success) {
        setReservation(reservationResponse.reservation);
        setRemainingTime(reservationResponse.reservation.remainingSeconds);
        setSelectedDate(date);
        setSelectedTime(time);
        setShowCalendarModal(false);
        setStep(3); // Move to patient details step
        toast.success('Time slot reserved for 10 minutes!');
      }
    } catch (error) {
      console.error('Error reserving slot:', error);
      toast.error(error.response?.data?.message || 'Failed to reserve time slot');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    console.log('✅ Payment successful, proceeding to complete booking');
    await handleBooking();
  };

  const handleBooking = async () => {
    try {
      setLoading(true);

      if (!appointmentDetails.reason.trim()) {
        toast.error('Please provide a reason for the appointment');
        return;
      }

      console.log('🔄 Completing reservation with booking details...');

      // Complete the reservation with booking details
      const response = await appointmentService.completeReservation(reservation.id, {
        elderId: selectedElder.id,
        duration: 30,
        type: appointmentDetails.type,
        priority: appointmentDetails.priority,
        reason: appointmentDetails.reason,
        symptoms: appointmentDetails.symptoms,
        notes: appointmentDetails.notes,
        allowMedicalRecordAccess: medicalRecordAccess.allowAccess,
        visibilityNotes: medicalRecordAccess.notes
      });

      if (response.success) {
        toast.success('Appointment booked successfully!');
        setReservation(null);
        setRemainingTime(0);
        
        // Navigate to appointments list after a short delay
        setTimeout(() => {
          navigate('/family/appointments');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
      
      // If reservation expired, reset to step 2
      if (error.response?.data?.message?.includes('expired')) {
        handleReservationExpired();
      }
    } finally {
      setLoading(false);
    }
  };

  const createPaymentIntent = async () => {
    try {
      const response = await appointmentService.createPaymentIntent({
        amount: selectedDoctor.consultationFee
      });
      setPaymentIntent(response.paymentIntent);
      return response.paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to initialize payment');
      throw error;
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {[
          { step: 1, label: 'Select Elder' },
          { step: 2, label: 'Choose Doctor & Time' },
          { step: 3, label: 'Patient Details' },
          { step: 4, label: 'Medical Records Access' },
          { step: 5, label: 'Payment' }
        ].map(({ step: stepNumber, label }) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
              step >= stepNumber 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 5 && (
              <div className={`w-12 h-1 mx-1 ${
                step > stepNumber ? 'bg-red-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">
            {step === 1 && 'Select Elder'}
            {step === 2 && 'Choose Doctor & Time'}
            {step === 3 && 'Patient Details'}
            {step === 4 && 'Medical Records Access'}
            {step === 5 && 'Payment'}
          </div>
          {reservation && remainingTime > 0 && (
            <div className="mt-2 flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="text-red-600 font-semibold">
                Time remaining: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderElderSelection = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-6">Select Elder for Appointment</h2>
      {elders.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No elders found. Please add an elder first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {elders.map((elder) => (
            <div
              key={elder.id}
              onClick={() => setSelectedElder(elder)}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                selectedElder?.id === elder.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                {elder.photo ? (
                  <img
                    src={`/uploads/elders/${elder.photo}`}
                    alt={elder.firstName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{elder.firstName} {elder.lastName}</h3>
                  <p className="text-gray-600">
                    Age: {Math.floor((new Date() - new Date(elder.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))}
                  </p>
                  <p className="text-gray-600 capitalize">{elder.gender}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Navigation */}
      {selectedElder && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setStep(2)}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Next: Choose Doctor
          </button>
        </div>
      )}
    </div>
  );

  const renderDoctorSelection = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-6">Choose Doctor</h2>
      {doctors.length === 0 ? (
        <div className="text-center py-12">
          <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No doctors available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => handleDoctorSelect(doctor)}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                selectedDoctor?.id === doctor.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-start space-x-4">
                {doctor.user?.profileImage ? (
                  <img
                    src={doctor.user.profileImage}
                    alt={`Dr. ${doctor.user.firstName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-8 h-8 text-blue-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                  </h3>
                  <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                  <p className="text-gray-600">{doctor.experience} years experience</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-green-600 font-semibold">${doctor.consultationFee}</span>
                    {doctor.rating && (
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 text-gray-600">{doctor.rating}</span>
                      </div>
                    )}
                  </div>
                  {doctor.languages && (
                    <p className="text-sm text-gray-500 mt-1">
                      Languages: {doctor.languages.join(', ')}
                    </p>
                  )}
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Select & View Calendar
                </button>
              </div>
              {doctor.about && (
                <p className="text-gray-600 mt-3 text-sm">{doctor.about}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPatientDetails = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Patient Details</h2>
      
      {/* Appointment Summary */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold text-lg mb-4">Appointment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Elder:</span>
            <span className="font-medium">
              {selectedElder?.firstName} {selectedElder?.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Doctor:</span>
            <span className="font-medium">
              Dr. {selectedDoctor?.user?.firstName} {selectedDoctor?.user?.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">
              {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-gray-600">Consultation Fee:</span>
            <span className="font-medium text-green-600 text-lg">
              ${selectedDoctor?.consultationFee}
            </span>
          </div>
        </div>
      </div>

      {/* Appointment Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Type
          </label>
          <select
            value={appointmentDetails.type}
            onChange={(e) => setAppointmentDetails(prev => ({ ...prev, type: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="consultation">Consultation</option>
            <option value="follow-up">Follow-up</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={appointmentDetails.priority}
            onChange={(e) => setAppointmentDetails(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Visit *
        </label>
        <textarea
          value={appointmentDetails.reason}
          onChange={(e) => setAppointmentDetails(prev => ({ ...prev, reason: e.target.value }))}
          placeholder="Please describe the reason for this appointment..."
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>

      {/* Symptoms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Symptoms (Optional)
        </label>
        <textarea
          value={appointmentDetails.symptoms}
          onChange={(e) => setAppointmentDetails(prev => ({ ...prev, symptoms: e.target.value }))}
          placeholder="Describe any current symptoms..."
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={appointmentDetails.notes}
          onChange={(e) => setAppointmentDetails(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional information you'd like the doctor to know..."
          rows={2}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Navigation */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => {
            if (reservation) {
              appointmentService.cancelReservation(reservation.id).catch(console.error);
            }
            setStep(2);
          }}
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <button
          type="button"
          onClick={() => setStep(4)}
          disabled={!appointmentDetails.reason.trim()}
          className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next: Medical Records
        </button>
      </div>
    </div>
  );

  const renderMedicalRecordsAccess = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Medical Records Access Permission</h2>
      
      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Privacy & Data Control</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              You have full control over your elder's medical information. By granting access, 
              the doctor will be able to view previous consultation records and vital signs 
              to provide better, more informed care.
            </p>
          </div>
        </div>
      </div>

      {/* Access Control Checkbox */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <label className="flex items-start space-x-4 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={medicalRecordAccess.allowAccess}
              onChange={(e) => setMedicalRecordAccess(prev => ({ 
                ...prev, 
                allowAccess: e.target.checked 
              }))}
              className="w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {medicalRecordAccess.allowAccess ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-semibold text-lg text-gray-900">
                Allow doctor to view elder's medical records and vitals
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Granting access allows the doctor to view:
            </p>
            <ul className="mt-2 ml-4 space-y-1 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <span>Previous consultation records and diagnoses</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <span>Recent vital signs (blood pressure, heart rate, etc.)</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <span>Treatment history and medications</span>
              </li>
            </ul>
          </div>
        </label>

        {/* Status Indicator */}
        <div className={`mt-4 p-3 rounded-lg ${
          medicalRecordAccess.allowAccess 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-orange-50 border border-orange-200'
        }`}>
          <div className="flex items-center space-x-2">
            {medicalRecordAccess.allowAccess ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Access Granted</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800 font-medium">Access Restricted</span>
              </>
            )}
          </div>
          <p className={`mt-1 text-sm ${
            medicalRecordAccess.allowAccess ? 'text-green-700' : 'text-orange-700'
          }`}>
            {medicalRecordAccess.allowAccess 
              ? 'The doctor will have access to view previous medical records for this appointment.'
              : 'The doctor will not be able to view previous medical records. They will only see information you provide in this appointment.'}
          </p>
        </div>
      </div>

      {/* Optional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={medicalRecordAccess.notes}
          onChange={(e) => setMedicalRecordAccess(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any specific preferences or concerns about medical record access..."
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Navigation */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <button
          type="button"
          onClick={() => setStep(5)}
          className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Payment</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-lg mb-4">Appointment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Elder:</span>
            <span className="font-medium">
              {selectedElder?.firstName} {selectedElder?.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Doctor:</span>
            <span className="font-medium">
              Dr. {selectedDoctor?.user?.firstName} {selectedDoctor?.user?.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">
              {selectedDate && new Date(selectedDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-gray-600">Consultation Fee:</span>
            <span className="font-medium text-green-600 text-lg">
              ${selectedDoctor?.consultationFee}
            </span>
          </div>
        </div>
      </div>

      <Elements stripe={stripePromise}>
        <AppointmentPaymentForm
          amount={selectedDoctor?.consultationFee}
          paymentIntent={paymentIntent}
          appointmentId="temp"
          onSuccess={handlePaymentSuccess}
          onBack={() => setStep(4)}
        />
      </Elements>
    </div>
  );

  const canProceedToNext = () => {
    switch (step) {
      case 1: return selectedElder;
      case 2: return selectedDoctor && selectedDate && selectedTime;
      case 3: return appointmentDetails.reason.trim().length >= 10;
      case 4: return true; // Payment handled by payment form
      default: return false;
    }
  };

  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6 flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-800">Book Appointment</h1>
        </div>

        {renderStepIndicator()}

        <div className="bg-white rounded-lg shadow-lg p-8">
          {step === 1 && renderElderSelection()}
          {step === 2 && renderDoctorSelection()}
          {step === 3 && renderPatientDetails()}
          {step === 4 && renderMedicalRecordsAccess()}
          {step === 5 && renderPaymentForm()}

          {/* Calendar Modal */}
          {showCalendarModal && selectedDoctor && (
            <DoctorCalendarModal
              doctor={selectedDoctor}
              onClose={() => setShowCalendarModal(false)}
              onSlotSelect={handleSlotSelect}
            />
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default AppointmentBooking;