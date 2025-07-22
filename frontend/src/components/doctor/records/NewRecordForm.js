// src/components/doctor/records/NewRecordForm.js
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  FileText, 
  User, 
  Calendar, 
  Stethoscope,
  Activity,
  Heart,
  Pill,
  AlertCircle,
  CheckCircle,
  Upload,
  Plus,
  Minus,
  Search,
  Clock,
  MapPin,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

const NewRecordForm = ({ isOpen, onClose, onSuccess, selectedPatient = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchPatient, setSearchPatient] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);

  const [formData, setFormData] = useState({
    // Step 1: Patient Selection
    patientId: selectedPatient?.id || '',
    patientName: selectedPatient?.name || '',
    
    // Step 2: Record Basic Info
    recordType: 'Consultation',
    category: 'General Medicine',
    priority: 'normal',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    
    // Step 3: Medical Details
    chiefComplaint: '',
    presentIllness: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: '',
    followUpRequired: false,
    followUpDate: '',
    
    // Step 4: Vital Signs
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    },
    
    // Step 5: Medications & Procedures
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    procedures: [{ name: '', description: '', date: '' }],
    
    // Step 6: Attachments & Additional Info
    attachments: [],
    referrals: '',
    emergencyContact: '',
    insuranceInfo: ''
  });

  // Mock patients data - replace with actual API call
  useEffect(() => {
    if (isOpen) {
      const mockPatients = [
        { id: 'P-001', name: 'Eleanor Johnson', age: 72, phone: '+1-555-0101' },
        { id: 'P-002', name: 'Robert Smith', age: 68, phone: '+1-555-0102' },
        { id: 'P-003', name: 'Mary Wilson', age: 75, phone: '+1-555-0103' },
        { id: 'P-004', name: 'James Brown', age: 70, phone: '+1-555-0104' },
        { id: 'P-005', name: 'Sarah Davis', age: 65, phone: '+1-555-0105' }
      ];
      setPatients(mockPatients);
      setFilteredPatients(mockPatients);
    }
  }, [isOpen]);

  // Patient search functionality
  useEffect(() => {
    if (searchPatient) {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchPatient.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchPatient, patients]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleProcedureChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.map((proc, i) =>
        i === index ? { ...proc, [field]: value } : proc
      )
    }));
  };

  const addProcedure = () => {
    setFormData(prev => ({
      ...prev,
      procedures: [...prev.procedures, { name: '', description: '', date: '' }]
    }));
  };

  const removeProcedure = (index) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.filter((_, i) => i !== index)
    }));
  };

  const selectPatient = (patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name
    }));
    setCurrentStep(2);
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.patientId) {
          toast.error('Please select a patient');
          return false;
        }
        break;
      case 2:
        if (!formData.recordType || !formData.category || !formData.date) {
          toast.error('Please fill in all required fields');
          return false;
        }
        break;
      case 3:
        if (!formData.chiefComplaint || !formData.diagnosis) {
          toast.error('Chief complaint and diagnosis are required');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      // Simulate API call - replace with actual medical record service
      console.log('Creating new medical record:', formData);
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Medical record created successfully!');
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        patientId: '',
        patientName: '',
        recordType: 'Consultation',
        category: 'General Medicine',
        priority: 'normal',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        chiefComplaint: '',
        presentIllness: '',
        diagnosis: '',
        treatmentPlan: '',
        notes: '',
        followUpRequired: false,
        followUpDate: '',
        vitalSigns: {
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          weight: '',
          height: '',
          respiratoryRate: '',
          oxygenSaturation: ''
        },
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        procedures: [{ name: '', description: '', date: '' }],
        attachments: [],
        referrals: '',
        emergencyContact: '',
        insuranceInfo: ''
      });
      setCurrentStep(1);
      
    } catch (error) {
      console.error('Error creating medical record:', error);
      toast.error('Failed to create medical record');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Patient</h3>
              
              {/* Patient Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by patient name or ID..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                />
              </div>

              {/* Patient List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formData.patientId === patient.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                    onClick={() => selectPatient(patient)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">ID: {patient.id} • Age: {patient.age}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {patient.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Record Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Record Type *
                </label>
                <select
                  name="recordType"
                  value={formData.recordType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Lab Results">Lab Results</option>
                  <option value="Treatment Plan">Treatment Plan</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Endocrinology">Endocrinology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Medical Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chief Complaint *
              </label>
              <textarea
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Patient's primary complaint or reason for visit..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                History of Present Illness
              </label>
              <textarea
                name="presentIllness"
                value={formData.presentIllness}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Detailed description of the current illness..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis *
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Primary and secondary diagnoses..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treatment Plan
              </label>
              <textarea
                name="treatmentPlan"
                value={formData.treatmentPlan}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Recommended treatment and care plan..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Additional observations, recommendations, or notes..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="followUpRequired"
                  checked={formData.followUpRequired}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Follow-up required</span>
              </label>

              {formData.followUpRequired && (
                <div>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Vital Signs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  name="vitalSigns.bloodPressure"
                  value={formData.vitalSigns.bloodPressure}
                  onChange={handleInputChange}
                  placeholder="120/80"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heart Rate
                </label>
                <input
                  type="text"
                  name="vitalSigns.heartRate"
                  value={formData.vitalSigns.heartRate}
                  onChange={handleInputChange}
                  placeholder="72 bpm"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature
                </label>
                <input
                  type="text"
                  name="vitalSigns.temperature"
                  value={formData.vitalSigns.temperature}
                  onChange={handleInputChange}
                  placeholder="98.6°F"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight
                </label>
                <input
                  type="text"
                  name="vitalSigns.weight"
                  value={formData.vitalSigns.weight}
                  onChange={handleInputChange}
                  placeholder="150 lbs"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <input
                  type="text"
                  name="vitalSigns.height"
                  value={formData.vitalSigns.height}
                  onChange={handleInputChange}
                  placeholder="5'6 inches"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respiratory Rate
                </label>
                <input
                  type="text"
                  name="vitalSigns.respiratoryRate"
                  value={formData.vitalSigns.respiratoryRate}
                  onChange={handleInputChange}
                  placeholder="16/min"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oxygen Saturation
                </label>
                <input
                  type="text"
                  name="vitalSigns.oxygenSaturation"
                  value={formData.vitalSigns.oxygenSaturation}
                  onChange={handleInputChange}
                  placeholder="98%"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Medications & Procedures</h3>
            
            {/* Medications Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-700">Medications</h4>
                <button
                  type="button"
                  onClick={addMedication}
                  className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medication</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.medications.map((medication, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medication Name
                        </label>
                        <input
                          type="text"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          placeholder="e.g., Lisinopril"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          placeholder="e.g., 10mg"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency
                        </label>
                        <input
                          type="text"
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          placeholder="e.g., Once daily"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={medication.duration}
                            onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                            placeholder="e.g., 30 days"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        {formData.medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Procedures Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-700">Procedures</h4>
                <button
                  type="button"
                  onClick={addProcedure}
                  className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Procedure</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.procedures.map((procedure, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Procedure Name
                        </label>
                        <input
                          type="text"
                          value={procedure.name}
                          onChange={(e) => handleProcedureChange(index, 'name', e.target.value)}
                          placeholder="e.g., Blood Draw"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={procedure.date}
                          onChange={(e) => handleProcedureChange(index, 'date', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-end">
                        {formData.procedures.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProcedure(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={procedure.description}
                        onChange={(e) => handleProcedureChange(index, 'description', e.target.value)}
                        rows={2}
                        placeholder="Procedure details and notes..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referrals
              </label>
              <textarea
                name="referrals"
                value={formData.referrals}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Specialist referrals or additional care recommendations..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Information
              </label>
              <textarea
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Emergency contact details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Information
              </label>
              <textarea
                name="insuranceInfo"
                value={formData.insuranceInfo}
                onChange={handleInputChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Insurance provider and policy details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload medical documents, lab results, or images
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Choose Files
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, JPG, PNG up to 10MB each
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 1: return <User className="w-5 h-5" />;
      case 2: return <FileText className="w-5 h-5" />;
      case 3: return <Stethoscope className="w-5 h-5" />;
      case 4: return <Activity className="w-5 h-5" />;
      case 5: return <Pill className="w-5 h-5" />;
      case 6: return <Upload className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Create New Medical Record</h2>
              <p className="text-purple-100 text-sm">
                Step {currentStep} of 6: {
                  currentStep === 1 ? 'Patient Selection' :
                  currentStep === 2 ? 'Record Information' :
                  currentStep === 3 ? 'Medical Details' :
                  currentStep === 4 ? 'Vital Signs' :
                  currentStep === 5 ? 'Medications & Procedures' :
                  'Additional Information'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-purple-700 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === currentStep
                    ? 'bg-purple-600 text-white'
                    : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    getStepIcon(step)
                  )}
                </div>
                {step < 6 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Record</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRecordForm;