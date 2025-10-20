import React, { useState } from 'react';
import { X, FileText, Loader, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const UploadRecordModal = ({ isOpen, onClose, appointment }) => {
  const [loading, setLoading] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [sessionSummary, setSessionSummary] = useState('');
  const [medicationNotes, setMedicationNotes] = useState('');
  const [prescriptionAttached, setPrescriptionAttached] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sessionSummary || !diagnosis) {
      toast.error('Please fill in Session Summary and Diagnosis');
      return;
    }

    try {
      setLoading(true);
      const consultationData = {
        appointmentId: appointment.id,
        elderId: appointment.elderId,
        sessionDate: new Date().toISOString(),
        symptoms,
        diagnosis,
        treatment,
        recommendations,
        sessionSummary,
        prescriptionAttached,
        medicationNotes,
        status: 'completed'
      };

      const response = await api.post('/doctor/consultations/records', consultationData);
      
      if (response.data.success) {
        toast.success('Consultation record saved!');
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const elder = appointment.elder || {};

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Consultation Record</h2>
              <p>Patient: {elder.firstName} {elder.lastName}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Symptoms</label>
            <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows="3" className="w-full px-4 py-2 border rounded-lg" placeholder="Patient symptoms..." />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Diagnosis <span className="text-red-600">*</span></label>
            <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows="3" className="w-full px-4 py-2 border rounded-lg" placeholder="Enter diagnosis..." required />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Treatment Plan</label>
            <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} rows="3" className="w-full px-4 py-2 border rounded-lg" placeholder="Treatment plan..." />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Session Summary <span className="text-red-600">*</span></label>
            <textarea value={sessionSummary} onChange={(e) => setSessionSummary(e.target.value)} rows="4" className="w-full px-4 py-2 border rounded-lg" placeholder="Consultation summary..." required />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Recommendations</label>
            <textarea value={recommendations} onChange={(e) => setRecommendations(e.target.value)} rows="3" className="w-full px-4 py-2 border rounded-lg" placeholder="Recommendations..." />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={prescriptionAttached} onChange={(e) => setPrescriptionAttached(e.target.checked)} className="w-5 h-5" />
              <span className="font-semibold">Prescription Provided</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Medication Notes</label>
            <textarea value={medicationNotes} onChange={(e) => setMedicationNotes(e.target.value)} rows="3" className="w-full px-4 py-2 border rounded-lg" placeholder="Medication details..." />
          </div>
        </form>

        <div className="border-t p-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg" disabled={loading}>Cancel</button>
          <button type="submit" form="upload-form" onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2">
            {loading ? <><Loader className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Record</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadRecordModal;
