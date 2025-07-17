import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import { InventoryContext } from '../../../context/InventoryContext';

const AddNewItem = () => {
  const { items, setItems } = useContext(InventoryContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    location: '',
    expirationDate: '',
    usage: '',
    prescriptionRequired: false,
    notes: '',
    lastUpdated: new Date().toISOString().split('T')[0],
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [lowStockWarning, setLowStockWarning] = useState('');

  useEffect(() => {
    if (formData.quantity && parseInt(formData.quantity) < 10) {
      setLowStockWarning('⚠️ Low stock will trigger auto-reorder!');
    } else {
      setLowStockWarning('');
    }
  }, [formData.quantity]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.expirationDate) {
      alert('Please fill in all required fields.');
      return;
    }

    const newItem = {
      ...formData,
      id: items.length + 1,
      quantity: parseInt(formData.quantity),
      reorderTriggered: parseInt(formData.quantity) < 10,
    };

    setItems([...items, newItem]);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      navigate('/pharmacist/inventory');
    }, 2000);
  };

  const daysUntilExpiration = () => {
    if (!formData.expirationDate) return null;
    const today = new Date();
    const expiry = new Date(formData.expirationDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} day(s) left` : '⚠️ Already expired!';
  };

  return (
    <RoleLayout title="Add New Inventory Item">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800">Add New Medication</h2>

        {showSuccess && (
          <p className="text-green-600 text-sm font-medium bg-green-100 p-2 rounded">
            ✅ Item successfully added!
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Quantity <span className="text-red-500">*</span></label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="0" required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            {lowStockWarning && <p className="text-yellow-600 text-xs mt-1">{lowStockWarning}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Expiration Date <span className="text-red-500">*</span></label>
            <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            {formData.expirationDate && (
              <p className="text-sm text-gray-500 mt-1 italic">{daysUntilExpiration()}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Usage</label>
            <input type="text" name="usage" value={formData.usage} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          <div className="flex items-center mt-6 space-x-2">
            <input type="checkbox" name="prescriptionRequired" checked={formData.prescriptionRequired} onChange={handleChange} />
            <label className="text-sm font-semibold">Prescription Required</label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Additional Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Any special handling, storage instructions, or batch notes..."></textarea>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button type="button" onClick={() => navigate('/pharmacist/inventory')} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold">
            Add Item
          </button>
        </div>
      </form>
    </RoleLayout>
  );
};

export default AddNewItem;
