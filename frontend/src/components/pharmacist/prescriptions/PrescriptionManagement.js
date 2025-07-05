// src/components/pharmacist/prescriptions/PrescriptionManagement.js
import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { PlusCircle, CheckCircle2 } from 'lucide-react';

const PrescriptionManagement = () => {
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patient: 'Alice Johnson',
      doctor: 'Dr. Lee',
      medicine: 'Metformin',
      dosage: '500 mg',
      status: 'Pending',
    },
    {
      id: 2,
      patient: 'Mark Wilson',
      doctor: 'Dr. Kim',
      medicine: 'Lisinopril',
      dosage: '10 mg',
      status: 'Dispensed',
    },
  ]);

  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    medicine: '',
    dosage: '',
  });

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addPrescription = () => {
    const { patient, doctor, medicine, dosage } = form;
    if (patient && doctor && medicine && dosage) {
      setPrescriptions((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          ...form,
          status: 'Pending',
        },
      ]);
      setForm({ patient: '', doctor: '', medicine: '', dosage: '' });
    }
  };

  const markDispensed = (id) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'Dispensed' } : p
      )
    );
  };

  return (
    <RoleLayout title="Prescription Management">
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Heading */}
          <header className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Prescription Dashboard
            </h2>
            <p className="text-slate-500">
              Manage and monitor patient prescriptions with ease.
            </p>
          </header>

          {/* Prescription Table */}
          <section className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Prescriptions</h3>

            {prescriptions.length === 0 ? (
              <p className="text-slate-500 italic">No prescriptions added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-slate-200">
                  <thead className="bg-slate-100 text-left">
                    <tr>
                      <th className="px-4 py-3">Patient</th>
                      <th className="px-4 py-3">Doctor</th>
                      <th className="px-4 py-3">Medicine</th>
                      <th className="px-4 py-3">Dosage</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {prescriptions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">{p.patient}</td>
                        <td className="px-4 py-3">{p.doctor}</td>
                        <td className="px-4 py-3">{p.medicine}</td>
                        <td className="px-4 py-3">{p.dosage}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium
                              ${p.status === 'Dispensed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-yellow-100 text-yellow-700'
                              }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p.status !== 'Dispensed' && (
                            <button
                              onClick={() => markDispensed(p.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 text-white px-3 py-1.5 text-xs hover:bg-emerald-700"
                            >
                              <CheckCircle2 size={14} />
                              Dispense
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Add Prescription Form */}
          <section className="bg-white rounded-xl shadow p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-700 mb-6">
              <PlusCircle size={20} className="text-indigo-600" />
              Add New Prescription
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Patient Name</label>
                <input
                  name="patient"
                  value={form.patient}
                  onChange={onChange}
                  placeholder="e.g., Kevin Lee"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Doctor</label>
                <input
                  name="doctor"
                  value={form.doctor}
                  onChange={onChange}
                  placeholder="e.g., Dr. Harris"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Medicine</label>
                <input
                  name="medicine"
                  value={form.medicine}
                  onChange={onChange}
                  placeholder="e.g., Ibuprofen"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Dosage</label>
                <input
                  name="dosage"
                  value={form.dosage}
                  onChange={onChange}
                  placeholder="e.g., 500 mg"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={addPrescription}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Add Prescription
              </button>
            </div>
          </section>
        </div>
      </div>
    </RoleLayout>
  );
};

export default PrescriptionManagement;
