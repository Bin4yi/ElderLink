// src/components/pharmacist/inventory/MedicineProfile.js
import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import { InventoryContext } from '../../../context/InventoryContext';
import {
  ArrowLeft,
  Info,
  Calendar,
  MapPin,
  ClipboardList,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';

const Badge = ({ text, type }) => {
  const colors = {
    yes: 'bg-green-100 text-green-700',
    no: 'bg-red-100 text-red-700',
    neutral: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${colors[type]}`}>
      {text}
    </span>
  );
};

const MedicineProfile = () => {
  const { id } = useParams();
  const { items, setItems } = useContext(InventoryContext);
  const navigate = useNavigate();

  const medicine = items.find(item => item.id === parseInt(id));

  if (!medicine) {
    return (
      <RoleLayout title="Medicine Not Found">
        <div className="text-center p-6">
          <p className="text-red-600 font-semibold text-lg">⚠️ Medicine not found in inventory.</p>
          <button onClick={() => navigate(-1)} className="mt-6 px-5 py-2 bg-gray-300 hover:bg-gray-400 rounded">
            <ArrowLeft className="inline mr-1" size={16} /> Go Back
          </button>
        </div>
      </RoleLayout>
    );
  }

  const handleDelete = () => {
    const confirm = window.confirm(`Are you sure you want to delete "${medicine.name}" from inventory?`);
    if (confirm) {
      setItems(prev => prev.filter(item => item.id !== medicine.id));
      navigate('/pharmacist/inventory');
    }
  };

  return (
    <RoleLayout title={`Details of ${medicine.name}`}>
      <div className="bg-white p-8 rounded-lg shadow max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-indigo-800 flex items-center gap-2">
          <Info size={28} /> {medicine.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800">
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm space-y-2">
            <p><strong>Quantity:</strong> {medicine.quantity}</p>
            <p className="flex items-center gap-1"><Calendar size={16} /> <strong>Expires:</strong> {medicine.expirationDate}</p>
            <p className="flex items-center gap-1"><MapPin size={16} /> <strong>Location:</strong> {medicine.location || '—'}</p>
            <p className="flex items-center gap-1"><ClipboardList size={16} /> <strong>Usage:</strong> {medicine.usage || '—'}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 shadow-sm space-y-2">
            <p><strong>Prescription Required:</strong>{' '}
              <Badge
                text={medicine.prescriptionRequired ? 'Yes' : 'No'}
                type={medicine.prescriptionRequired ? 'yes' : 'no'}
              />
            </p>
            <p><strong>Reorder Triggered:</strong>{' '}
              <Badge
                text={medicine.reorderTriggered ? 'Yes' : 'No'}
                type={medicine.reorderTriggered ? 'no' : 'yes'}
              />
            </p>
            <p className="flex items-center gap-1"><Clock size={16} /> <strong>Last Updated:</strong> {medicine.lastUpdated || '—'}</p>
            <p><strong>Notes:</strong> {medicine.notes || 'No additional notes.'}</p>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate('/pharmacist/inventory')}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow"
          >
            <ArrowLeft size={18} /> Back to Inventory
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow"
          >
            <Trash2 size={18} /> Delete Item
          </button>
        </div>
      </div>
    </RoleLayout>
  );
};

export default MedicineProfile;
