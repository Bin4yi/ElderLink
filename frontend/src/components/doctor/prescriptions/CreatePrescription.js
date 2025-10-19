// src/components/doctor/prescriptions/CreatePrescriptionFromConsultation.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  User, Package, FileText, Save, X, Plus, Trash2, ArrowLeft
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const CreatePrescriptionFromConsultation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { consultationId } = useParams();
  
  // Get elder and consultation data from navigation state
  const consultationData = location.state?.consultation;
  
  const [elder, setElder] = useState(null);
  const [consultation, setConsultation] = useState(consultationData || null);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [deliveryRequired, setDeliveryRequired] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form for adding new medication
  const [medicationForm, setMedicationForm] = useState({
    medicationName: '',
    genericName: '',
    strength: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantityPrescribed: '',
    instructions: '',
    substitutionAllowed: true
  });

  useEffect(() => {
    if (consultationId) {
      fetchConsultationDetails();
    }
    fetchPharmacies();
  }, [consultationId]);

  const fetchConsultationDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // If we already have consultation data from navigation, use it
      if (consultationData) {
        setConsultation(consultationData);
        if (consultationData.elder) {
          setElder(consultationData.elder);
          // Pre-fill delivery address if available
          if (consultationData.elder.address) {
            setDeliveryAddress(consultationData.elder.address);
          }
        }
        setLoading(false);
        return;
      }

      // Otherwise fetch from API
      const response = await axios.get(
        `${API_BASE_URL}/consultations/${consultationId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setConsultation(response.data.consultation);
        if (response.data.consultation.elder) {
          setElder(response.data.consultation.elder);
          // Pre-fill delivery address if available
          if (response.data.consultation.elder.address) {
            setDeliveryAddress(response.data.consultation.elder.address);
          }
        }
      } else {
        toast.error('Failed to load consultation details');
        navigate('/doctor/consultations');
      }
    } catch (error) {
      console.error('Error fetching consultation details:', error);
      toast.error('Failed to load consultation details');
      navigate('/doctor/consultations');
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/auth/pharmacies`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📦 Pharmacies API Response:', response.data);

      if (response.data.success && Array.isArray(response.data.pharmacies)) {
        setPharmacies(response.data.pharmacies);
        console.log('✅ Pharmacies loaded:', response.data.pharmacies.length);
      } else {
        console.warn('⚠️ Unexpected response format:', response.data);
        setPharmacies([]);
        toast.error('Failed to load pharmacies');
      }
    } catch (error) {
      console.error('❌ Error fetching pharmacies:', error);
      setPharmacies([]);
      toast.error('Failed to load pharmacies');
    }
  };

  const addMedicationFromForm = () => {
    // Validate form
    if (!medicationForm.medicationName || !medicationForm.dosage || !medicationForm.quantityPrescribed) {
      toast.error('Please fill in medication name, dosage, and quantity');
      return;
    }

    setSelectedItems([...selectedItems, {
      ...medicationForm,
      id: Date.now()
    }]);

    // Reset form
    setMedicationForm({
      medicationName: '',
      genericName: '',
      strength: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantityPrescribed: '',
      instructions: '',
      substitutionAllowed: true
    });
    
    toast.success('Medication added to prescription');
  };

  const removeMedication = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
    toast.success('Medication removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPharmacyId) {
      toast.error('Please select a pharmacy');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    // Validate all items have required fields
    for (const item of selectedItems) {
      if (!item.medicationName || !item.dosage || !item.quantityPrescribed) {
        toast.error('All medications must have name, dosage, and quantity');
        return;
      }
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const prescriptionData = {
        elderId: elder.id,
        appointmentId: consultationId,
        pharmacyId: selectedPharmacyId,
        medications: selectedItems,
        notes: notes,
        deliveryRequired: deliveryRequired,
        deliveryAddress: deliveryRequired ? deliveryAddress : null
      };

      console.log('📤 Submitting prescription:', prescriptionData);

      const response = await axios.post(
        `${API_BASE_URL}/prescriptions`,
        prescriptionData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Prescription created successfully!');
        navigate('/doctor/prescriptions');
      } else {
        toast.error(response.data.message || 'Failed to create prescription');
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <RoleLayout title="Create Prescription">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </RoleLayout>
    );
  }

  if (!elder) {
    return (
      <RoleLayout title="Create Prescription">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Elder Information Not Found
            </h3>
            <p className="text-red-700 mb-4">
              Unable to load elder details for this consultation.
            </p>
            <button
              onClick={() => navigate('/doctor/consultations')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Consultations
            </button>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="Create Prescription">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/doctor/consultations')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Consultations
        </button>

        {/* Consultation Info Banner */}
        {consultation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  Creating Prescription for Consultation
                </h3>
                <p className="text-sm text-blue-700">
                  Date: {new Date(consultation.appointmentDate).toLocaleDateString()} | 
                  Time: {consultation.appointmentTime}
                  {consultation.consultationType && ` | Type: ${consultation.consultationType}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Elder Info Card - Read-only */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {elder.firstName} {elder.lastName}
              </h2>
              <div className="mt-2 space-y-1">
                <p className="text-gray-700">
                  <span className="font-semibold">Date of Birth:</span> {new Date(elder.dateOfBirth).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Age:</span> {Math.floor((new Date() - new Date(elder.dateOfBirth)) / 31557600000)} years
                </p>
                {elder.gender && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Gender:</span> {elder.gender}
                  </p>
                )}
                {elder.phone && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Phone:</span> {elder.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="px-4 py-2 bg-blue-100 rounded-lg">
              <p className="text-sm font-semibold text-blue-800">Auto-Selected</p>
              <p className="text-xs text-blue-600">From Consultation</p>
            </div>
          </div>
        </div>

        {/* Prescription Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Pharmacy */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Select Pharmacy
            </h3>
            <select
              value={selectedPharmacyId}
              onChange={(e) => setSelectedPharmacyId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Select a Pharmacy --</option>
              {Array.isArray(pharmacies) && pharmacies.map((pharmacy) => (
                <option key={pharmacy.id} value={pharmacy.id}>
                  {pharmacy.firstName} {pharmacy.lastName}
                  {pharmacy.email && ` (${pharmacy.email})`}
                  {pharmacy.phone && ` - ${pharmacy.phone}`}
                </option>
              ))}
            </select>
            {Array.isArray(pharmacies) && pharmacies.length === 0 && (
              <p className="mt-2 text-sm text-red-600 font-medium">⚠️ No pharmacies found in the system</p>
            )}
          </div>

          {/* Add Medication Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Add Medication
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Paracetamol"
                  value={medicationForm.medicationName}
                  onChange={(e) => setMedicationForm({...medicationForm, medicationName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Generic Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Acetaminophen"
                  value={medicationForm.genericName}
                  onChange={(e) => setMedicationForm({...medicationForm, genericName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strength
                </label>
                <input
                  type="text"
                  placeholder="e.g., 500mg"
                  value={medicationForm.strength}
                  onChange={(e) => setMedicationForm({...medicationForm, strength: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1 tablet"
                  value={medicationForm.dosage}
                  onChange={(e) => setMedicationForm({...medicationForm, dosage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={medicationForm.frequency}
                  onChange={(e) => setMedicationForm({...medicationForm, frequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
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
                  placeholder="e.g., 7 days"
                  value={medicationForm.duration}
                  onChange={(e) => setMedicationForm({...medicationForm, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 14"
                  value={medicationForm.quantityPrescribed}
                  onChange={(e) => setMedicationForm({...medicationForm, quantityPrescribed: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g., Take after meals"
                  value={medicationForm.instructions}
                  onChange={(e) => setMedicationForm({...medicationForm, instructions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="substitutionAllowed"
                  checked={medicationForm.substitutionAllowed}
                  onChange={(e) => setMedicationForm({...medicationForm, substitutionAllowed: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="substitutionAllowed" className="text-sm font-medium text-gray-700">
                  Allow Substitution
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={addMedicationFromForm}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Medication to Prescription
            </button>
          </div>

          {/* Prescribed Medications List */}
          {selectedItems.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Prescribed Medications ({selectedItems.length})
              </h3>
              <div className="space-y-3">
                {selectedItems.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{item.medicationName}</div>
                        {item.genericName && (
                          <div className="text-sm text-gray-600">Generic: {item.genericName}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {item.strength && <div><span className="font-medium">Strength:</span> {item.strength}</div>}
                      <div><span className="font-medium">Dosage:</span> {item.dosage}</div>
                      {item.frequency && <div><span className="font-medium">Frequency:</span> {item.frequency}</div>}
                      {item.duration && <div><span className="font-medium">Duration:</span> {item.duration}</div>}
                      <div><span className="font-medium">Quantity:</span> {item.quantityPrescribed}</div>
                      <div><span className="font-medium">Substitution:</span> {item.substitutionAllowed ? 'Allowed' : 'Not Allowed'}</div>
                    </div>
                    {item.instructions && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Instructions:</span> {item.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Additional Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional instructions, warnings, or notes..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="deliveryRequired"
                  checked={deliveryRequired}
                  onChange={(e) => setDeliveryRequired(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="deliveryRequired" className="text-sm font-medium text-gray-700">
                  Delivery Required
                </label>
              </div>

              {deliveryRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter delivery address..."
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={deliveryRequired}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/doctor/consultations')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedItems.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Prescription
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </RoleLayout>
  );
};

export default CreatePrescriptionFromConsultation;
