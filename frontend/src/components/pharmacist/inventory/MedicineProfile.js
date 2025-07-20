import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import { ArrowLeft, Info, Calendar, MapPin, ClipboardList, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';


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
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/inventory/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setMedicine(data))
      .catch(() => setNotFound(true));
  }, [id]);

  const formatDate = (rawDate) => {
    if (!rawDate) return '—';
    const date = new Date(rawDate);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
  html: `
    <p class="text-sm text-gray-700">
      This action <strong>cannot be undone.</strong><br />
      Deleting this item will permanently remove it from your inventory.
    </p>
    <p class="text-xs text-gray-500 mt-2">
      Are you sure you want to proceed?
    </p>
  `,
  icon: 'warning',
  iconColor: '#f43f5e',
  iconSize: '2.5px',
  showCancelButton: true,
  confirmButtonText: 'Yes, delete it',
  cancelButtonText: 'Cancel',
  buttonsStyling: false,
  width: '500px',
  height: '200px',
  padding: '1.5rem',
  customClass: {
    popup: 'rounded-lg border border-gray-300 shadow-md px-6 py-5',
  title: 'text-lg font-medium text-gray-900',
  htmlContainer: 'text-sm text-gray-600 leading-relaxed mt-3',
  icon: 'scale-90 mt-1 mb-2 text-red-500',
  confirmButton: 'bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2 rounded-md transition duration-200',
  cancelButton: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2 rounded-md transition duration-200',
  actions: 'flex justify-center gap-6 mt-6'
  }
});
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/api/inventory/${medicine.id}`, {
          method: 'DELETE'
        });
  
        if (response.ok) {
          toast.success('✅ Item deleted successfully!');
          navigate('/pharmacist/inventory');
        } else {
          const error = await response.json();
          toast.error(`❌ Deletion failed: ${error.message}`);
        }
      } catch (err) {
        toast.error('❌ Network error. Please try again.');
        console.error(err);
      }
    } else {
      toast('🛑 Deletion cancelled.');
    }
  };
  

  if (!medicine && !notFound) {
    return (
      <RoleLayout title="Loading...">
        <div className="text-center p-6 text-gray-500 italic">Fetching medicine details...</div>
      </RoleLayout>
    );
  }

  if (notFound) {
    return (
      <RoleLayout title="Medicine Not Found">
        <div className="text-center p-6">
          <p className="text-red-600 font-semibold text-lg">⚠️ Medicine not found in inventory.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-5 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            <ArrowLeft className="inline mr-1" size={16} /> Go Back
          </button>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title={`Medicine Details`}>
      <div className="bg-white p-8 rounded-lg shadow max-w-4xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-indigo-800 flex items-center gap-2 border-b pb-2">
          <Info size={28} /> {medicine.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800 text-sm">
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="flex items-center gap-2">
              <ClipboardList size={16} /> <strong>Usage:</strong> {medicine.usage || '—'}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} /> <strong>Location:</strong> {medicine.location || '—'}
            </p>
            <p className="flex items-center gap-2">
              <Calendar size={16} /> <strong>Expiration:</strong> {formatDate(medicine.expirationDate)}
            </p>
            <p className="flex items-center gap-2">
              <Clock size={16} /> <strong>Last Updated:</strong> {formatDate(medicine.lastUpdated)}
            </p>
            <p><strong>Price:</strong> Rs {medicine.price}</p>

          </div>

          <div className="space-y-4 bg-gray-50 p-4 rounded-lg shadow-sm">
            <p><strong>Quantity in Stock:</strong> {medicine.quantity}</p>
            <p>
              <strong>Prescription Required:</strong>{' '}
              <Badge
                text={medicine.prescriptionRequired ? 'Yes' : 'No'}
                type={medicine.prescriptionRequired ? 'yes' : 'no'}
              />
            </p>
            <p>
              <strong>Reorder Status:</strong>{' '}
              {medicine.quantity < 10 ? (
                <Badge text="Reorder Needed" type="no" />
              ) : (
                <Badge text="Sufficient" type="yes" />
              )}
            </p>
            <p><strong>Notes:</strong> {medicine.notes || 'No additional notes provided.'}</p>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t mt-6 flex-wrap gap-3">
          <button
            onClick={() => navigate('/pharmacist/inventory')}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow"
          >
            <ArrowLeft size={18} /> Back to Inventory
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/pharmacist/inventory/edit/${medicine.id}`)}
              className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded shadow"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default MedicineProfile;
