// frontend/src/components/doctor/sessions/CompleteSessionModal.js
import React, { useState, useEffect } from 'react';
import { 
  completeSessionWithPrescription, 
  getPharmacies 
} from '../../../services/monthlySessionService';
import './CompleteSessionModal.css';

const CompleteSessionModal = ({ session, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Notes, 2: Prescription, 3: Review
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    doctorNotes: '',
    sessionSummary: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenSaturation: '',
      weight: ''
    },
    nextSessionDate: '',
    prescription: {
      pharmacyId: '',
      pharmacyName: '',
      items: [],
      notes: '',
      priority: 'normal',
      deliveryRequired: false,
      deliveryAddress: ''
    }
  });

  const [currentMedication, setCurrentMedication] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: '',
    instructions: ''
  });

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoadingPharmacies(true);
      const response = await getPharmacies();
      setPharmacies(response.data.pharmacies || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      alert('Failed to load pharmacies');
    } finally {
      setLoadingPharmacies(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVitalSignsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value
      }
    }));
  };

  const handlePrescriptionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        [field]: value
      }
    }));

    // Update pharmacy name when pharmacy ID changes
    if (field === 'pharmacyId') {
      const pharmacy = pharmacies.find(p => p.id === value);
      setFormData(prev => ({
        ...prev,
        prescription: {
          ...prev.prescription,
          pharmacyName: pharmacy ? pharmacy.name : ''
        }
      }));
    }
  };

  const handleMedicationChange = (field, value) => {
    setCurrentMedication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMedication = () => {
    // Validate medication
    if (!currentMedication.medicationName || !currentMedication.dosage || !currentMedication.frequency) {
      alert('Please fill in medication name, dosage, and frequency');
      return;
    }

    setFormData(prev => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        items: [...prev.prescription.items, { ...currentMedication }]
      }
    }));

    // Reset form
    setCurrentMedication({
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: '',
      instructions: ''
    });
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      prescription: {
        ...prev.prescription,
        items: prev.prescription.items.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate
      if (!formData.doctorNotes.trim()) {
        alert('Please add doctor notes');
        return;
      }

      if (formData.prescription.items.length > 0 && !formData.prescription.pharmacyId) {
        alert('Please select a pharmacy for the prescription');
        return;
      }

      // Submit
      const submitData = {
        ...formData,
        prescription: formData.prescription.items.length > 0 ? formData.prescription : undefined
      };

      const response = await completeSessionWithPrescription(session.id, submitData);

      alert('✅ Session completed successfully!');
      
      if (onSuccess) {
        onSuccess(response.data);
      }

      onClose();
    } catch (error) {
      console.error('Error completing session:', error);
      alert(`❌ Error: ${error.message || 'Failed to complete session'}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.doctorNotes.trim()) {
      alert('Please add doctor notes before continuing');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Session - {session.elder?.firstName} {session.elder?.lastName}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Session Notes</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Prescription</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Review</div>
        </div>

        <div className="modal-body">
          {/* Step 1: Session Notes */}
          {step === 1 && (
            <div className="step-content">
              <h3>Session Notes & Vitals</h3>

              <div className="form-group">
                <label>Doctor's Notes *</label>
                <textarea
                  rows="5"
                  value={formData.doctorNotes}
                  onChange={(e) => handleInputChange('doctorNotes', e.target.value)}
                  placeholder="Enter your observations, diagnosis, and recommendations..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Session Summary</label>
                <textarea
                  rows="3"
                  value={formData.sessionSummary}
                  onChange={(e) => handleInputChange('sessionSummary', e.target.value)}
                  placeholder="Brief summary of the session..."
                />
              </div>

              <h4>Vital Signs</h4>
              <div className="vitals-grid">
                <div className="form-group">
                  <label>Blood Pressure</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={(e) => handleVitalSignsChange('bloodPressure', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Heart Rate (bpm)</label>
                  <input
                    type="number"
                    placeholder="72"
                    value={formData.vitalSigns.heartRate}
                    onChange={(e) => handleVitalSignsChange('heartRate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    value={formData.vitalSigns.temperature}
                    onChange={(e) => handleVitalSignsChange('temperature', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>O₂ Saturation (%)</label>
                  <input
                    type="number"
                    placeholder="98"
                    value={formData.vitalSigns.oxygenSaturation}
                    onChange={(e) => handleVitalSignsChange('oxygenSaturation', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Weight (lbs)</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={formData.vitalSigns.weight}
                    onChange={(e) => handleVitalSignsChange('weight', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Next Session Date</label>
                <input
                  type="date"
                  value={formData.nextSessionDate}
                  onChange={(e) => handleInputChange('nextSessionDate', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Prescription */}
          {step === 2 && (
            <div className="step-content">
              <h3>Prescription Details</h3>

              <div className="form-group">
                <label>Select Pharmacy *</label>
                {loadingPharmacies ? (
                  <p>Loading pharmacies...</p>
                ) : (
                  <select
                    value={formData.prescription.pharmacyId}
                    onChange={(e) => handlePrescriptionChange('pharmacyId', e.target.value)}
                  >
                    <option value="">-- Select Pharmacy --</option>
                    {pharmacies.map(pharmacy => (
                      <option key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name} - {pharmacy.address || pharmacy.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.prescription.priority}
                  onChange={(e) => handlePrescriptionChange('priority', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.prescription.deliveryRequired}
                    onChange={(e) => handlePrescriptionChange('deliveryRequired', e.target.checked)}
                  />
                  Delivery Required
                </label>
              </div>

              {formData.prescription.deliveryRequired && (
                <div className="form-group">
                  <label>Delivery Address</label>
                  <textarea
                    rows="2"
                    value={formData.prescription.deliveryAddress}
                    onChange={(e) => handlePrescriptionChange('deliveryAddress', e.target.value)}
                    placeholder="Enter delivery address..."
                  />
                </div>
              )}

              <h4>Add Medications</h4>
              <div className="medication-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Medication Name *</label>
                    <input
                      type="text"
                      value={currentMedication.medicationName}
                      onChange={(e) => handleMedicationChange('medicationName', e.target.value)}
                      placeholder="e.g., Lisinopril"
                    />
                  </div>
                  <div className="form-group">
                    <label>Dosage *</label>
                    <input
                      type="text"
                      value={currentMedication.dosage}
                      onChange={(e) => handleMedicationChange('dosage', e.target.value)}
                      placeholder="e.g., 10mg"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Frequency *</label>
                    <input
                      type="text"
                      value={currentMedication.frequency}
                      onChange={(e) => handleMedicationChange('frequency', e.target.value)}
                      placeholder="e.g., Once daily"
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={currentMedication.duration}
                      onChange={(e) => handleMedicationChange('duration', e.target.value)}
                      placeholder="e.g., 30 days"
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={currentMedication.quantity}
                      onChange={(e) => handleMedicationChange('quantity', e.target.value)}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Instructions</label>
                  <input
                    type="text"
                    value={currentMedication.instructions}
                    onChange={(e) => handleMedicationChange('instructions', e.target.value)}
                    placeholder="e.g., Take with food"
                  />
                </div>

                <button className="btn btn-add" onClick={addMedication}>
                  ➕ Add Medication
                </button>
              </div>

              {/* Medications List */}
              {formData.prescription.items.length > 0 && (
                <div className="medications-list">
                  <h4>Medications ({formData.prescription.items.length})</h4>
                  {formData.prescription.items.map((med, index) => (
                    <div key={index} className="medication-item">
                      <div className="medication-details">
                        <strong>{med.medicationName}</strong> - {med.dosage}
                        <br />
                        <small>{med.frequency} {med.duration && `for ${med.duration}`}</small>
                        {med.instructions && <br />}
                        {med.instructions && <small>📝 {med.instructions}</small>}
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => removeMedication(index)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-group">
                <label>Prescription Notes</label>
                <textarea
                  rows="2"
                  value={formData.prescription.notes}
                  onChange={(e) => handlePrescriptionChange('notes', e.target.value)}
                  placeholder="Additional notes for the pharmacist..."
                />
              </div>

              <p className="info-text">
                ℹ️ You can skip adding prescription if not needed
              </p>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="step-content">
              <h3>Review & Submit</h3>

              <div className="review-section">
                <h4>Session Information</h4>
                <p><strong>Patient:</strong> {session.elder?.firstName} {session.elder?.lastName}</p>
                <p><strong>Date:</strong> {new Date(session.sessionDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {session.sessionTime}</p>
              </div>

              <div className="review-section">
                <h4>Doctor's Notes</h4>
                <p>{formData.doctorNotes || 'No notes added'}</p>
              </div>

              {formData.sessionSummary && (
                <div className="review-section">
                  <h4>Session Summary</h4>
                  <p>{formData.sessionSummary}</p>
                </div>
              )}

              <div className="review-section">
                <h4>Vital Signs</h4>
                <div className="vitals-summary">
                  {formData.vitalSigns.bloodPressure && <p>🩺 BP: {formData.vitalSigns.bloodPressure}</p>}
                  {formData.vitalSigns.heartRate && <p>💓 HR: {formData.vitalSigns.heartRate} bpm</p>}
                  {formData.vitalSigns.temperature && <p>🌡️ Temp: {formData.vitalSigns.temperature}°F</p>}
                  {formData.vitalSigns.oxygenSaturation && <p>🫁 O₂: {formData.vitalSigns.oxygenSaturation}%</p>}
                  {formData.vitalSigns.weight && <p>⚖️ Weight: {formData.vitalSigns.weight} lbs</p>}
                </div>
              </div>

              {formData.prescription.items.length > 0 && (
                <div className="review-section">
                  <h4>Prescription</h4>
                  <p><strong>Pharmacy:</strong> {formData.prescription.pharmacyName}</p>
                  <p><strong>Priority:</strong> {formData.prescription.priority.toUpperCase()}</p>
                  <p><strong>Medications:</strong></p>
                  <ul>
                    {formData.prescription.items.map((med, index) => (
                      <li key={index}>
                        {med.medicationName} ({med.dosage}) - {med.frequency}
                      </li>
                    ))}
                  </ul>
                  {formData.prescription.deliveryRequired && (
                    <p><strong>🚚 Delivery Required</strong></p>
                  )}
                </div>
              )}

              {formData.nextSessionDate && (
                <div className="review-section">
                  <h4>Next Session</h4>
                  <p>{new Date(formData.nextSessionDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={prevStep} disabled={loading}>
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button className="btn btn-primary" onClick={nextStep}>
              Next →
            </button>
          ) : (
            <button 
              className="btn btn-success" 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? '⏳ Submitting...' : '✅ Complete Session'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteSessionModal;
