// src/components/doctor/prescriptions/CreatePrescription.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, Package, Save, X, FileText, User
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const CreatePrescription = () => {
  const navigate = useNavigate();
  const { appointmentId, elderId } = useParams();
  
  const [elder, setElder] = useState(null);
  const [elders, setElders] = useState([]);
  const [selectedElderId, setSelectedElderId] = useState(elderId || '');
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [deliveryRequired, setDeliveryRequired] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
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
    fetchElders();
    fetchPharmacies();
  }, []);

  useEffect(() => {
    if (selectedElderId) {
      fetchElderDetails(selectedElderId);
    }
  }, [selectedElderId]);

  const fetchElders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/doctor-assignments/doctor/assigned-elders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Assigned Elders API Response:', response.data);
      
      // Handle different response formats
      if (response.data.success && response.data.elders) {
        setElders(response.data.elders);
      } else if (Array.isArray(response.data)) {
        setElders(response.data);
      } else {
        setElders([]);
      }
    } catch (error) {
      console.error('Error fetching assigned elders:', error);
      toast.error('Failed to load assigned elders: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchElderDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching elder details for ID:', id);
      
      // Use the doctor-specific endpoint to avoid authorization issues
      const response = await axios.get(`${API_BASE_URL}/elders/doctor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Elder details response:', response.data);
      
      // Handle different response formats
      if (response.data.success && response.data.elder) {
        setElder(response.data.elder);
        setDeliveryAddress(response.data.elder.address || '');
      } else if (response.data && response.data.id) {
        // Direct elder object
        setElder(response.data);
        setDeliveryAddress(response.data.address || '');
      } else {
        console.error('Unexpected response format:', response.data);
        toast.error('Failed to load elder details - unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching elder details:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load elder details: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchPharmacies = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching pharmacies from:', `${API_BASE_URL}/auth/pharmacies`);
      
      const response = await axios.get(`${API_BASE_URL}/auth/pharmacies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Pharmacies API Response:', response.data);
      console.log('📋 Number of pharmacies found:', response.data?.pharmacies?.length || 0);
      
      if (response.data.success && response.data.pharmacies) {
        console.log('✅ Setting pharmacies state with:', response.data.pharmacies);
        setPharmacies(response.data.pharmacies);
      } else if (Array.isArray(response.data)) {
        console.log('✅ Setting pharmacies state with array:', response.data);
        setPharmacies(response.data);
      } else {
        console.warn('⚠️ No pharmacies data in response, setting empty array');
        setPharmacies([]);
      }
    } catch (error) {
      console.error('❌ Error fetching pharmacies:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error('Failed to load pharmacies: ' + (error.response?.data?.message || error.message));
      setPharmacies([]);
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
      id: Date.now() // Temporary ID for frontend
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
      if (!item.quantityPrescribed || item.quantityPrescribed <= 0) {
        toast.error('Please specify quantity for all medications');
        return;
      }
      if (!item.dosage) {
        toast.error('Please specify dosage for all medications');
        return;
      }
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const prescriptionData = {
        elderId: selectedElderId || elderId,
        pharmacyId: selectedPharmacyId,
        appointmentId: appointmentId || null,
        items: selectedItems,
        notes,
        deliveryRequired,
        deliveryAddress: deliveryRequired ? deliveryAddress : null
      };

      const response = await axios.post(
        `${API_BASE_URL}/prescriptions/doctor/create`,
        prescriptionData,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data.success) {
        toast.success('Prescription created successfully!');
        navigate('/doctor/prescriptions');
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleLayout title="Create Prescription">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Elder Selection - Show if no elder selected */}
        {!elder && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Select Elder
            </h3>
            <select
              value={selectedElderId}
              onChange={(e) => setSelectedElderId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Select an Elder --</option>
              {Array.isArray(elders) && elders.map((elderOption) => (
                <option key={elderOption.id} value={elderOption.id}>
                  {elderOption.firstName} {elderOption.lastName} - DOB: {new Date(elderOption.dateOfBirth).toLocaleDateString()}
                </option>
              ))}
            </select>
            {!Array.isArray(elders) && (
              <p className="mt-2 text-sm text-red-600">Error loading elders list</p>
            )}
            {Array.isArray(elders) && elders.length === 0 && (
              <p className="mt-2 text-sm text-gray-600">No elders found in the system</p>
            )}
          </div>
        )}

        {/* Elder Info Card */}
        {elder && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {elder.firstName} {elder.lastName}
                </h2>
                <p className="text-gray-600">
                  DOB: {new Date(elder.dateOfBirth).toLocaleDateString()} | 
                  Age: {Math.floor((new Date() - new Date(elder.dateOfBirth)) / 31557600000)} years
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setElder(null);
                  setSelectedElderId('');
                  setSelectedItems([]);
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Change Elder
              </button>
            </div>
          </div>
        )}

        {/* Only show form if elder is selected */}
        {elder && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pharmacy Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Select Pharmacy
              </h3>
              {console.log('🔍 Rendering pharmacy dropdown with pharmacies:', pharmacies)}
              <select
                value={selectedPharmacyId}
                onChange={(e) => setSelectedPharmacyId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- Select a Pharmacy --</option>
                {Array.isArray(pharmacies) && pharmacies.map((pharmacy) => {
                  console.log('🏥 Rendering pharmacy option:', pharmacy);
                  return (
                    <option key={pharmacy.id} value={pharmacy.id}>
                      {pharmacy.firstName} {pharmacy.lastName} - {pharmacy.email}
                    </option>
                  );
                })}
              </select>
              {Array.isArray(pharmacies) && pharmacies.length === 0 && (
                <p className="mt-2 text-sm text-red-600 font-medium">⚠️ No pharmacies found in the system</p>
              )}
            </div>

            {/* Medication Form */}
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

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
        )}
      </div>
    </RoleLayout>
  );
};

export default CreatePrescription;
