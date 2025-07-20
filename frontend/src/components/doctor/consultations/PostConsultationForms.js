// frontend/src/components/doctor/consultation/PostConsultationForms.js
import React, { useState } from 'react';
import { 
  FileText, 
  Pill, 
  User, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../common/Modal';
import consultationService from '../../../services/consultation'

const PostConsultationForms = ({ appointment, onClose, onComplete }) => {
  const [activeTab, setActiveTab] = useState('consultation');
  const [loading, setLoading] = useState(false);

  // Consultation Form State
  const [consultationForm, setConsultationForm] = useState({
    diagnosis: '',
    treatment: '',
    recommendations: '',
    sessionSummary: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenSaturation: '',
      weight: '',
      height: ''
    },
    symptoms: '',
    followUpRequired: false,
    followUpDate: '',
    actualDuration: appointment?.duration || 60
  });

  // Prescription Form State
  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: [
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }
    ],
    generalInstructions: '',
    validUntil: ''
  });

  const [consultationCompleted, setConsultationCompleted] = useState(false);
  const [consultationId, setConsultationId] = useState(null);

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    
    if (!consultationForm.sessionSummary.trim()) {
      toast.error('Session summary is required');
      return;
    }

    setLoading(true);
    try {
      const response = await consultationService.completeConsultation(
        appointment.id, 
        consultationForm
      );
      
      setConsultationCompleted(true);
      setConsultationId(response.consultationRecord.id);
      toast.success('Consultation completed successfully');
      
      // Switch to prescription tab
      setActiveTab('prescription');
    } catch (error) {
      console.error('Error completing consultation:', error);
      toast.error('Failed to complete consultation');
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    
    if (!consultationId) {
      toast.error('Please complete consultation first');
      return;
    }

    // Validate medications
    const validMedications = prescriptionForm.medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim()
    );

    if (validMedications.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    setLoading(true);
    try {
      await consultationService.createPrescription(consultationId, {
        medications: validMedications,
        instructions: prescriptionForm.generalInstructions,
        validUntil: prescriptionForm.validUntil || null
      });
      
      toast.success('Prescription created successfully');
      onComplete();
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [...prev.medications, {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }]
    }));
  };

  const removeMedication = (index) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index, field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const updateVitalSign = (field, value) => {
    setConsultationForm(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value
      }
    }));
  };

  const renderConsultationForm = () => (
    <form onSubmit={handleConsultationSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Consultation Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosis *
            </label>
            <textarea
              value={consultationForm.diagnosis}
              onChange={(e) => setConsultationForm(prev => ({...prev, diagnosis: e.target.value}))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Primary diagnosis and findings..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treatment Plan
            </label>
            <textarea
              value={consultationForm.treatment}
              onChange={(e) => setConsultationForm(prev => ({...prev, treatment: e.target.value}))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Treatment plan and medications..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendations
            </label>
            <textarea
              value={consultationForm.recommendations}
              onChange={(e) => setConsultationForm(prev => ({...prev, recommendations: e.target.value}))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Lifestyle recommendations, follow-up care..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms Observed
            </label>
            <textarea
              value={consultationForm.symptoms}
              onChange={(e) => setConsultationForm(prev => ({...prev, symptoms: e.target.value}))}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Patient's symptoms during consultation..."
            />
          </div>
        </div>

        {/* Vital Signs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Pressure
              </label>
              <input
                type="text"
                value={consultationForm.vitalSigns.bloodPressure}
                onChange={(e) => updateVitalSign('bloodPressure', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="120/80"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={consultationForm.vitalSigns.heartRate}
                onChange={(e) => updateVitalSign('heartRate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="72"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°F)
              </label>
              <input
                type="number"
                step="0.1"
                value={consultationForm.vitalSigns.temperature}
                onChange={(e) => updateVitalSign('temperature', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="98.6"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oxygen Saturation (%)
              </label>
              <input
                type="number"
                value={consultationForm.vitalSigns.oxygenSaturation}
                onChange={(e) => updateVitalSign('oxygenSaturation', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="98"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={consultationForm.vitalSigns.weight}
                onChange={(e) => updateVitalSign('weight', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="150"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (in)
              </label>
              <input
                type="number"
                value={consultationForm.vitalSigns.height}
                onChange={(e) => updateVitalSign('height', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="68"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Session Summary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session Summary *
        </label>
        <textarea
          value={consultationForm.sessionSummary}
          onChange={(e) => setConsultationForm(prev => ({...prev, sessionSummary: e.target.value}))}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Comprehensive summary of the consultation session..."
          required
        />
      </div>

      {/* Follow-up */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="followUpRequired"
            checked={consultationForm.followUpRequired}
            onChange={(e) => setConsultationForm(prev => ({...prev, followUpRequired: e.target.checked}))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="followUpRequired" className="text-sm font-medium text-gray-700">
            Follow-up appointment required
          </label>
        </div>

        {consultationForm.followUpRequired && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Date
              </label>
              <input
                type="date"
                value={consultationForm.followUpDate}
                onChange={(e) => setConsultationForm(prev => ({...prev, followUpDate: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Duration (minutes)
              </label>
              <input
                type="number"
                value={consultationForm.actualDuration}
                onChange={(e) => setConsultationForm(prev => ({...prev, actualDuration: parseInt(e.target.value)}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Complete Consultation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );

  const renderPrescriptionForm = () => (
    <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
      {!consultationCompleted && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Please complete the consultation form first before adding prescriptions.
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Prescription Details</h3>
        <button
          type="button"
          onClick={addMedication}
          disabled={!consultationCompleted}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Medications */}
      <div className="space-y-4">
        {prescriptionForm.medications.map((medication, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-800">Medication {index + 1}</h4>
              {prescriptionForm.medications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={medication.name}
                  onChange={(e) => updateMedication(index, 'name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Metformin"
                  disabled={!consultationCompleted}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  value={medication.dosage}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 500mg"
                  disabled={!consultationCompleted}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency *
                </label>
                <select
                  value={medication.frequency}
                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!consultationCompleted}
                  required
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="Every 4 hours">Every 4 hours</option>
                  <option value="Every 6 hours">Every 6 hours</option>
                  <option value="Every 8 hours">Every 8 hours</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={medication.duration}
                  onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 30 days"
                  disabled={!consultationCompleted}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                value={medication.instructions}
                onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Take with food, before meals, etc."
                disabled={!consultationCompleted}
              />
            </div>
          </div>
        ))}
      </div>

      {/* General Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          General Instructions
        </label>
        <textarea
          value={prescriptionForm.generalInstructions}
          onChange={(e) => setPrescriptionForm(prev => ({...prev, generalInstructions: e.target.value}))}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="General instructions for all medications..."
          disabled={!consultationCompleted}
        />
      </div>

      {/* Valid Until */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Valid Until
        </label>
        <input
          type="date"
          value={prescriptionForm.validUntil}
          onChange={(e) => setPrescriptionForm(prev => ({...prev, validUntil: e.target.value}))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={new Date().toISOString().split('T')[0]}
          disabled={!consultationCompleted}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !consultationCompleted}
          className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Pill className="w-4 h-4" />
              <span>Save Prescription</span>
            </>
          )}
        </button>
      </div>
    </form>
  );

  const renderElderView = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            {appointment?.elder?.photo ? (
              <img 
                src={appointment.elder.photo} 
                alt={`${appointment.elder.firstName} ${appointment.elder.lastName}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900">
              {appointment?.elder?.firstName} {appointment?.elder?.lastName}
            </h4>
            <p className="text-gray-600">
              Age: {appointment?.elder?.dateOfBirth ? 
                Math.floor((new Date() - new Date(appointment.elder.dateOfBirth)) / 365.25 / 24 / 60 / 60 / 1000) : 
                'N/A'
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Date of Birth:</p>
            <p className="text-sm text-gray-900">
              {appointment?.elder?.dateOfBirth ? 
                new Date(appointment.elder.dateOfBirth).toLocaleDateString() : 
                'Not provided'
              }
            </p>
          </div>
          
          {appointment?.elder?.chronicConditions && (
            <div>
              <p className="text-sm font-medium text-gray-700">Chronic Conditions:</p>
              <p className="text-sm text-gray-900">{appointment.elder.chronicConditions}</p>
            </div>
          )}
          
          {appointment?.elder?.allergies && (
            <div>
              <p className="text-sm font-medium text-gray-700">Allergies:</p>
              <p className="text-sm text-gray-900">{appointment.elder.allergies}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-gray-700">Family Contact:</p>
            <p className="text-sm text-gray-900">
              {appointment?.familyMember?.firstName} {appointment?.familyMember?.lastName}
            </p>
            <p className="text-sm text-gray-600">{appointment?.familyMember?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-blue-900 mb-2">Appointment Details</h4>
        <div className="space-y-2">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Reason:</span> {appointment?.reason}
          </p>
          {appointment?.symptoms && (
            <p className="text-sm text-blue-800">
              <span className="font-medium">Symptoms:</span> {appointment.symptoms}
            </p>
          )}
          {appointment?.notes && (
            <p className="text-sm text-blue-800">
              <span className="font-medium">Notes:</span> {appointment.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose} size="4xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Post-Consultation Forms
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('consultation')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'consultation'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Consultation Report</span>
              {consultationCompleted && <CheckCircle className="w-4 h-4 text-green-400" />}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('prescription')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'prescription'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Pill className="w-4 h-4" />
              <span>Prescription</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('elder')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'elder'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Patient Details</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-h-96 overflow-y-auto">
          {activeTab === 'consultation' && renderConsultationForm()}
          {activeTab === 'prescription' && renderPrescriptionForm()}
          {activeTab === 'elder' && renderElderView()}
        </div>
      </div>
    </Modal>
  );
};

export default PostConsultationForms;