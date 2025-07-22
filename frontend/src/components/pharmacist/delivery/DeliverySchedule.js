// src/components/pharmacist/delivery/DeliverySchedule.js
import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { Truck, PlusCircle, CheckCircle } from 'lucide-react';

const DeliverySchedule = () => {
  const [deliveries, setDeliveries] = useState([
    { id: 1, patient: 'John Doe', medicine: 'Aspirin', time: '10:00 AM', status: 'Pending' },
    { id: 2, patient: 'Jane Smith', medicine: 'Paracetamol', time: '2:00 PM', status: 'Delivered' },
  ]);

  const [newDelivery, setNewDelivery] = useState({
    patient: '',
    medicine: '',
    time: '',
  });

  const handleChange = (e) => {
    setNewDelivery({ ...newDelivery, [e.target.name]: e.target.value });
  };

  const handleAddDelivery = () => {
    const { patient, medicine, time } = newDelivery;
    if (patient && medicine && time) {
      const newEntry = {
        id: deliveries.length + 1,
        patient,
        medicine,
        time,
        status: 'Pending',
      };
      setDeliveries([...deliveries, newEntry]);
      setNewDelivery({ patient: '', medicine: '', time: '' });
    }
  };

  const markAsDelivered = (id) => {
    const updated = deliveries.map((d) =>
      d.id === id ? { ...d, status: 'Delivered' } : d
    );
    setDeliveries(updated);
  };

  return (
    <RoleLayout title="Delivery Schedule">
      <div className="min-h-screen bg-slate-50 py-10 px-6">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* HEADER */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-800 flex justify-center items-center gap-2">
              <Truck className="text-indigo-600" size={28} />
              Delivery Management
            </h1>
            <p className="text-slate-500">Oversee, schedule, and update all medication deliveries.</p>
          </div>

          {/* DELIVERY LIST */}
          <section className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-700">Scheduled Deliveries</h2>
              <span className="text-sm text-slate-500">{deliveries.length} total</span>
            </div>

            {deliveries.length === 0 ? (
              <p className="text-slate-500 italic">No deliveries scheduled yet.</p>
            ) : (
              <div className="space-y-4">
                {deliveries.map((d) => (
                  <div
                    key={d.id}
                    className="flex justify-between items-center border rounded-md px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="space-y-1 text-sm">
                      <p><strong>Patient:</strong> {d.patient}</p>
                      <p><strong>Medicine:</strong> {d.medicine}</p>
                      <p><strong>Time:</strong> {d.time}</p>
                      <p>
                        <strong>Status:</strong>{' '}
                        <span
                          className={`font-semibold ${
                            d.status === 'Delivered' ? 'text-green-600' : 'text-yellow-600'
                          }`}
                        >
                          {d.status}
                        </span>
                      </p>
                    </div>

                    {d.status !== 'Delivered' && (
                      <button
                        onClick={() => markAsDelivered(d.id)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-md"
                      >
                        <CheckCircle size={16} />
                        Mark Delivered
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ADD NEW DELIVERY */}
          <section className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700">
              <PlusCircle className="text-indigo-600" size={20} />
              Schedule New Delivery
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="text"
                name="patient"
                value={newDelivery.patient}
                onChange={handleChange}
                placeholder="Patient Name"
                className="border border-slate-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="medicine"
                value={newDelivery.medicine}
                onChange={handleChange}
                placeholder="Medicine Name"
                className="border border-slate-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="time"
                value={newDelivery.time}
                onChange={handleChange}
                placeholder="Delivery Time (e.g., 4:00 PM)"
                className="border border-slate-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleAddDelivery}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              Add Delivery
            </button>
          </section>
        </div>
      </div>
    </RoleLayout>
  );
};

export default DeliverySchedule;
