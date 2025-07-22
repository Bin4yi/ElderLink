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
import { useNavigate } from 'react-router-dom'; // <-- Move this import up here

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');


const AppointmentBooking = ({ onBack, onSuccess }) => {
  const navigate = useNavigate();
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
  const [paymentIntent, setPaymentIntent] = useState(null);

  const [elders, setElders] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Load initial data
  useEffect(() => {
    loadElders();
    loadDoctors();
  }, []);

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

  const handleSlotSelect = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowCalendarModal(false);
    setStep(3); // Move to payment step
  };

  const handlePaymentSuccess = async (paymentResult) => {
    console.log('✅ Payment successful, proceeding to book appointment');
    setStep(4); // Move to appointment details
  };

  const handleBooking = async () => {
    try {
      setLoading(true);

      if (!selectedElder || !selectedDoctor || !selectedDate || !selectedTime) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!appointmentDetails.reason.trim()) {
        toast.error('Please provide a reason for the appointment');
        return;
      }

      const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}`);

      const bookingData = {
        elderId: selectedElder.id,
        doctorId: selectedDoctor.id,
        appointmentDate: appointmentDateTime.toISOString(),
        duration: 30,
        ...appointmentDetails
      };

      console.log('🔄 Booking appointment with data:', bookingData);

      const response = await appointmentService.bookAppointment(bookingData);
      
      toast.success('Appointment booked successfully!');
      onSuccess && onSuccess(response.appointment);
      
      // Reset form
      setStep(1);
      setSelectedElder(null);
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setAppointmentDetails({
        type: 'consultation',
        priority: 'medium',
        reason: '',
        symptoms: '',
        notes: ''
      });
      
    } catch (error) {
      console.error('❌ Booking error:', error);
      toast.error(error.message || 'Failed to book appointment');
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
      <div className="flex items-center justify-center space-x-8">
        {[
          { step: 1, label: 'Select Elder' },
          { step: 2, label: 'Choose Doctor' },
          { step: 3, label: 'Payment' },
          { step: 4, label: 'Book Appointment' }
        ].map(({ step: stepNumber, label }) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= stepNumber 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 4 && (
              <div className={`w-16 h-1 mx-2 ${
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
            {step === 2 && 'Choose Doctor'}
            {step === 3 && 'Payment'}
            {step === 4 && 'Complete Booking'}
          </div>
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
          appointmentId="temp" // This will be created after booking
          onSuccess={handlePaymentSuccess}
          onBack={() => setStep(2)}
        />
      </Elements>
    </div>
  );

  const renderAppointmentDetails = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Complete Your Appointment</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Type
          </label>
          <select
            value={appointmentDetails.type}
            onChange={(e) => setAppointmentDetails(prev => ({ ...prev, type: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="consultation">General Consultation</option>
            <option value="follow-up">Follow-up</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        {/* Priority */}
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

      {/* Final Summary */}
      <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
        <h3 className="font-semibold text-lg mb-4 text-green-800">Ready to Book</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-700">Elder:</span>
            <span className="font-medium">
              {selectedElder?.firstName} {selectedElder?.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Doctor:</span>
            <span className="font-medium">
              Dr. {selectedDoctor?.user?.firstName} {selectedDoctor?.user?.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Date:</span>
            <span className="font-medium">
              {selectedDate && new Date(selectedDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Time:</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Type:</span>
            <span className="font-medium capitalize">{appointmentDetails.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Payment:</span>
            <span className="font-medium text-green-600">✅ Completed</span>
          </div>
        </div>
      </div>
    </div>
  );

  const canProceedToNext = () => {
    switch (step) {
      case 1: return selectedElder;
      case 2: return selectedDoctor && selectedDate && selectedTime;
      case 3: return true; // Payment handled separately
      case 4: return appointmentDetails.reason.trim().length >= 10;
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
          {step === 3 && renderPaymentForm()}
          {step === 4 && renderAppointmentDetails()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => {
                if (step === 3) {
                  // If coming back from payment, go to doctor selection but show calendar
                  setStep(2);
                  if (selectedDoctor) {
                    setShowCalendarModal(true);
                  }
                } else {
                  setStep(Math.max(1, step - 1));
                }
              }}
              disabled={step === 1}
              className={`px-6 py-3 rounded-lg font-medium ${
                step === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            {step < 4 ? (
              step === 1 ? (
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedToNext()}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    canProceedToNext()
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              ) : null // Step 2 navigation handled by calendar modal, Step 3 by payment form
            ) : (
              <button
                onClick={handleBooking}
                disabled={loading || !canProceedToNext()}
                className={`px-8 py-3 rounded-lg font-medium ${
                  loading || !canProceedToNext()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Booking...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Book Appointment</span>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Calendar Modal */}
        {showCalendarModal && selectedDoctor && (
          <DoctorCalendarModal
            doctor={selectedDoctor}
            onClose={() => setShowCalendarModal(false)}
            onSlotSelect={handleSlotSelect}
          />
        )}
      </div>
    </RoleLayout>
  );
};

export default AppointmentBooking;