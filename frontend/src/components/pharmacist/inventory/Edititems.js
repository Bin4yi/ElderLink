// src/components/pharmacist/inventory/EditItem.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import { InventoryContext } from '../../../context/InventoryContext';
import { toast } from 'react-hot-toast';


const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, setItems } = useContext(InventoryContext);

  const existingItem = items.find(item => item.id === id);



  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    location: '',
    expirationDate: '',
    usage: '',
    prescriptionRequired: false,
    notes: '',
    lastUpdated: new Date().toISOString().split('T')[0],
    price: '',
  });

  const [lowStockWarning, setLowStockWarning] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (existingItem) {
      setFormData(existingItem);
    } else {
      setNotFound(true);
    }
  }, [existingItem]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const updatedItem = {
      ...formData,
      quantity: parseInt(formData.quantity),
      reorderTriggered: parseInt(formData.quantity) < 10,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedItem)
      });
  
      if (!response.ok) throw new Error('Failed to update item');
  
      const data = await response.json();
      // Update context state too
      const updatedItems = items.map(item => (item.id === id ? data : item));
      setItems(updatedItems);
  
      toast.success('✅ Item updated successfully!');
         navigate(`/pharmacist/inventory/${id}`);
        } catch (error) {
     toast.error(`❌ Error: ${error.message}`);
        }

  };
  
  if (notFound) {
    return (
      <RoleLayout title="Item Not Found">
        <div className="text-center p-6">
          <p className="text-red-600 font-semibold text-lg">⚠️ Item not found.</p>
          <button onClick={() => navigate('/pharmacist/inventory')} className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
            Back to Inventory
          </button>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="Edit Inventory Item">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800">Edit Medication Details</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" className="w-full border px-3 py-2 rounded" />
            {lowStockWarning && <p className="text-yellow-600 text-xs mt-1">{lowStockWarning}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Expiration Date</label>
            <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Usage</label>
            <input type="text" name="usage" value={formData.usage} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="flex items-center mt-6 space-x-2">
            <input type="checkbox" name="prescriptionRequired" checked={formData.prescriptionRequired} onChange={handleChange} />
            <label className="text-sm font-semibold">Prescription Required</label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Price per Unit (Rs)</label>
            <input type="number" name="price" step="0.01" value={formData.price} onChange={handleChange} required className="w-full border px-3 py-2 rounded"/>
            </div>

        </div>

        <div className="flex justify-between mt-6">
          <button type="button" onClick={() => navigate(`/pharmacist/inventory/${id}`)} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-semibold">
            Save Changes
          </button>
        </div>
      </form>
    </RoleLayout>
  );
};

export default EditItem;
