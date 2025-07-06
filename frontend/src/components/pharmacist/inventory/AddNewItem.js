import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import { InventoryContext } from '../../../context/InventoryContext';

const AddNewItem = () => {
  const navigate = useNavigate();
  const { addItem } = useContext(InventoryContext);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    quantity: '',
    expirationDate: '',
    usage: '',
    prescriptionRequired: false,
    instructions: '',
    sideEffects: '',
    legalApproval: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate a unique id for the new item
    const newItem = { ...formData, id: Date.now().toString() };
    addItem(newItem);
    navigate('/pharmacist/inventory');
  };

  return (
    <RoleLayout title="Add New Inventory Item">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label className="block font-semibold mb-1" htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="expirationDate">Expiration Date</label>
          <input
            type="date"
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="usage">Usage</label>
          <input
            type="text"
            id="usage"
            name="usage"
            value={formData.usage}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="prescriptionRequired"
              checked={formData.prescriptionRequired}
              onChange={handleChange}
              className="mr-2"
            />
            Prescription Required
          </label>
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="instructions">How to Use</label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="sideEffects">Side Effects</label>
          <textarea
            id="sideEffects"
            name="sideEffects"
            value={formData.sideEffects}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="legalApproval">Legal Approval</label>
          <input
            type="text"
            id="legalApproval"
            name="legalApproval"
            value={formData.legalApproval}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Item
        </button>
      </form>
    </RoleLayout>
  );
};

export default AddNewItem;
