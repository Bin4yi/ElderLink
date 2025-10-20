// src/components/doctor/consultations/UploadPrescriptionModal.js
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Loader, Pill } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadPrescriptionModal = ({ isOpen, onClose, appointment }) => {
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPharmacies();
    }
  }, [isOpen]);

  const loadPharmacies = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await pharmacyService.getPharmacies();
      
      // Mock data
      setPharmacies([
        { id: 1, name: 'HealthPlus Pharmacy', location: 'Downtown' },
        { id: 2, name: 'MediCare Drugs', location: 'Westside' },
        { id: 3, name: 'Community Pharmacy', location: 'Eastside' }
      ]);
    } catch (error) {
      console.error('Error loading pharmacies:', error);
      toast.error('Failed to load pharmacies');
    }
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedication = (index) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedPharmacy) {
      toast.error('Please select a pharmacy');
      return;
    }

    const validMedications = medications.filter(m => m.name && m.dosage);
    if (validMedications.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    try {
      setLoading(true);
      
      const prescriptionData = {
        appointmentId: appointment.id,
        elderId: appointment.elderId,
        pharmacyId: selectedPharmacy,
        medications: validMedications,
        notes: notes
      };

      // TODO: Replace with actual API call
      // const response = await prescriptionService.create(prescriptionData);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Prescription uploaded successfully!');
      onClose();
    } catch (error) {
      console.error('Error uploading prescription:', error);
      toast.error('Failed to upload prescription');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  const elder = appointment.elder || {};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Upload Prescription</h2>
                <p className="text-green-100">Patient: {elder.firstName} {elder.lastName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Pharmacy Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Select Pharmacy *
            </label>
            <select
              value={selectedPharmacy}
              onChange={(e) => setSelectedPharmacy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Choose a pharmacy...</option>
              {pharmacies.map(pharmacy => (
                <option key={pharmacy.id} value={pharmacy.id}>
                  {pharmacy.name} - {pharmacy.location}
                </option>
              ))}
            </select>
          </div>

          {/* Medications */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-700">
                Medications *
              </label>
              <button
                type="button"
                onClick={addMedication}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Medication
              </button>
            </div>

            <div className="space-y-4">
              {medications.map((medication, index) => (
                <div key={index} className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900">Medication {index + 1}</span>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Medicine Name *
                      </label>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        placeholder="e.g., Aspirin"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder="e.g., 100mg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <input
                        type="text"
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        placeholder="e.g., Twice daily"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={medication.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Instructions
                      </label>
                      <input
                        type="text"
                        value={medication.instructions}
                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                        placeholder="e.g., Take with food"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional instructions or notes for the pharmacist..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Prescription
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPrescriptionModal;
