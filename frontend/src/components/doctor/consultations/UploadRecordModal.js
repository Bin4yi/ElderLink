// src/components/doctor/consultations/UploadRecordModal.js
import React, { useState } from 'react';
import { X, Upload, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadRecordModal = ({ isOpen, onClose, appointment }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [recordType, setRecordType] = useState('consultation-notes');
  const [notes, setNotes] = useState('');

  if (!isOpen || !appointment) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recordType', recordType);
      formData.append('notes', notes);
      formData.append('appointmentId', appointment.id);
      formData.append('elderId', appointment.elderId);

      // TODO: Replace with actual API call
      // const response = await consultationService.uploadRecord(formData);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Record uploaded successfully!');
      onClose();
    } catch (error) {
      console.error('Error uploading record:', error);
      toast.error('Failed to upload record');
    } finally {
      setLoading(false);
    }
  };

  const elder = appointment.elder || {};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Upload Consultation Record</h2>
                <p className="text-purple-100">Patient: {elder.firstName} {elder.lastName}</p>
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
        <form onSubmit={handleSubmit} className="p-6">
          {/* Record Type */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Record Type
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="consultation-notes">Consultation Notes</option>
              <option value="lab-results">Lab Results</option>
              <option value="scan-report">Scan Report</option>
              <option value="medical-certificate">Medical Certificate</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Upload File (PDF, JPG, PNG - Max 10MB)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-500 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="file-upload"
                required
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {file ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-600 mb-2" />
                    <p className="text-gray-900 font-semibold">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-sm text-purple-600 mt-2">Click to change file</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-600 font-semibold">Click to upload file</p>
                    <p className="text-sm text-gray-500">PDF, JPG, PNG up to 10MB</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes about this record..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-semibold">Upload Guidelines</p>
                <ul className="text-sm text-blue-800 mt-1 space-y-1">
                  <li>• Ensure all patient information is clearly visible</li>
                  <li>• Use high-quality scans or photos</li>
                  <li>• Files are encrypted and HIPAA compliant</li>
                </ul>
              </div>
            </div>
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
              disabled={loading || !file}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadRecordModal;
