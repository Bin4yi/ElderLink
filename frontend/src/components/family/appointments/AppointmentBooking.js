// frontend/src/components/appointments/AppointmentBooking.js
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService } from '../../../services/appointment'; // ✅ FIXED: Changed from '../../services/appointment'
import { elderService } from '../../../services/elder'; // ✅ FIXED: Changed from '../../services/elder'

const AppointmentBooking = ({ onBack, onSuccess }) => {
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

  const [elders, setElders] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

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
      
      if (response && response.doctors) {
        setDoctors(response.doctors);
        console.log(`✅ Set ${response.doctors.length} doctors`);
      } else {
        console.warn('⚠️ No doctors in response:', response);
        setDoctors([]);
      }
    } catch (error) {
      console.error('❌ Error loading doctors:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show more specific error message
      if (error.response?.status === 404) {
        toast.error('Doctors endpoint not found. Please check backend routes.');
      } else if (error.response?.status === 500) {
        toast.error('Server error loading doctors. Please try again.');
      } else {
        toast.error(`Failed to load doctors: ${error.message}`);
      }
      
      setDoctors([]);
    }
  };

  const loadDoctorAvailability = async (doctorId, date) => {
    try {
      setLoading(true);
      const response = await appointmentService.getDoctorAvailability(doctorId, date);
      setAvailableSlots(response.availableSlots || []);
    } catch (error) {
      toast.error('Failed to load doctor availability');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (selectedDoctor && date) {
      loadDoctorAvailability(selectedDoctor.id, date);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedTime('');
    setAvailableSlots([]);
    if (selectedDate) {
      loadDoctorAvailability(doctor.id, selectedDate);
    }
  };

  const handleBooking = async () => {
    try {
      setLoading(true);

      if (!selectedElder || !selectedDoctor || !selectedDate || !selectedTime) {
        toast.error('Please fill in all required fields');
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

      const response = await appointmentService.bookAppointment(bookingData);
      
      toast.success('Appointment booked successfully!');
      onSuccess && onSuccess(response.appointment);
    } catch (error) {
      toast.error(error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-8">
        {[1, 2, 3, 4].map((stepNumber) => (
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
            {step === 3 && 'Select Date & Time'}
            {step === 4 && 'Appointment Details'}
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

  const renderDateTimeSelection = () => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days in advance

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-6">Select Date & Time</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateSelect(e.target.value)}
              min={today.toISOString().split('T')[0]}
              max={maxDate.toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Times
            </label>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
            ) : selectedDate && selectedDoctor ? (
              availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTime(slot.startTime)}
                      className={`p-3 text-sm border rounded-lg transition-all ${
                        selectedTime === slot.startTime
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No available slots for this date</p>
                </div>
              )
            ) : (
              <div className="text-center p-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Please select a date first</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAppointmentDetails = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Appointment Details</h2>
      
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

      {/* Summary */}
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
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium capitalize">{appointmentDetails.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fee:</span>
            <span className="font-medium text-green-600">
              ${selectedDoctor?.consultationFee}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const canProceedToNext = () => {
    switch (step) {
      case 1: return selectedElder;
      case 2: return selectedDoctor;
      case 3: return selectedDate && selectedTime;
      case 4: return appointmentDetails.reason.trim().length >= 10;
      default: return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-red-500 hover:text-red-600 font-medium mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Book Appointment</h1>
      </div>

      {renderStepIndicator()}

      <div className="bg-white rounded-lg shadow-lg p-8">
        {step === 1 && renderElderSelection()}
        {step === 2 && renderDoctorSelection()}
        {step === 3 && renderDateTimeSelection()}
        {step === 4 && renderAppointmentDetails()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
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
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceedToNext()}
              className={`px-6 py-3 rounded-lg font-medium ${
                canProceedToNext()
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
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
    </div>
  );
};

export default AppointmentBooking;