import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { PlusCircle, Trash2 } from 'lucide-react';

const MedicationManagement = () => {
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patient: 'John Doe',
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Twice a day',
      duration: '5 days',
    },
    {
      id: 2,
      patient: 'John Doe',
      name: 'Amoxicillin',
      dosage: '250mg',
      frequency: 'Once a day',
      duration: '7 days',
    },
    {
      id: 3,
      patient: 'Jane Smith',
      name: 'Cetirizine',
      dosage: '10mg',
      frequency: 'Once a day',
      duration: '3 days',
    },
  ]);

  const [newPrescription, setNewPrescription] = useState({
    patient: '',
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
  });

  const handleChange = (e) => {
    setNewPrescription({ ...newPrescription, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    const { patient, name, dosage, frequency, duration } = newPrescription;
    if (patient && name && dosage && frequency && duration) {
      const newItem = {
        id: prescriptions.length + 1,
        ...newPrescription,
      };
      setPrescriptions([...prescriptions, newItem]);
      setNewPrescription({
        patient: '',
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
      });
    }
  };

  const handleDelete = (id) => {
    const updated = prescriptions.filter((item) => item.id !== id);
    setPrescriptions(updated);
  };

  // Group by patient
  const groupedPrescriptions = prescriptions.reduce((acc, curr) => {
    if (!acc[curr.patient]) acc[curr.patient] = [];
    acc[curr.patient].push(curr);
    return acc;
  }, {});

  return (
    <RoleLayout title="Medication Management">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-10 space-y-12">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Medication Management</h2>
            <p className="text-gray-500 mt-2">
              Review and assign medications for elderly patients in a structured way.
            </p>
          </div>

          {/* Grouped Prescriptions */}
          <div className="space-y-6">
            {Object.entries(groupedPrescriptions).map(([patient, meds]) => (
              <div key={patient}>
                <h3 className="text-xl font-semibold text-blue-800 mb-3">{patient}</h3>
                <div className="space-y-3">
                  {meds.map((med) => (
                    <div
                      key={med.id}
                      className="flex justify-between items-center p-4 bg-blue-50 border border-blue-100 rounded-md"
                    >
                      <div>
                        <p className="text-sm"><strong>Medication:</strong> {med.name}</p>
                        <p className="text-sm text-gray-600">
                          {med.dosage}, {med.frequency} for {med.duration}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* New Prescription Form */}
          <div className="border-t pt-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <PlusCircle size={24} className="text-blue-600" />
              Assign New Medication
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'patient', label: 'Patient Name', placeholder: 'e.g., Kevin Lee' },
                { name: 'name', label: 'Medication Name', placeholder: 'e.g., Ibuprofen' },
                { name: 'dosage', label: 'Dosage', placeholder: 'e.g., 500mg' },
                { name: 'frequency', label: 'Frequency', placeholder: 'e.g., Twice a day' },
                { name: 'duration', label: 'Duration', placeholder: 'e.g., 5 days' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={newPrescription[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-sm transition"
              >
                Assign Medication
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default MedicationManagement;
