// src/components/pharmacist/prescriptions/PrescriptionManagement.js

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import {
  PlusCircle,
  CheckCircle2,
  XCircle,
  SendHorizonal,
  Trash2,
  ShoppingCart
} from 'lucide-react';

const PrescriptionManagement = () => {
  const [checkoutList, setCheckoutList] = useState([]);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState([]);
  const [rejectedPrescriptions, setRejectedPrescriptions] = useState([]);
  const [confirmedPrescriptions, setConfirmedPrescriptions] = useState([]);

  // Fetch from backend
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/simple-prescriptions');
        const data = await res.json();
        setCheckoutList(
          data.filter(p => p.status !== 'Verified' && p.status !== 'Confirmed' && p.status !== 'Rejected').map((item) => ({
            id: item.id,
            patient: item.patientname,
            doctor: item.doctorname,
            doctorLicense: item.doctorlicense,
            doctorSignature: item.doctorsignature,
            medicines: item.medicines,
            status: item.status // ✅ Use actual status from DB
          }))
        );
      } catch (err) {
        console.error('Failed to fetch prescriptions:', err);
      }
    };
    fetchPrescriptions();
  }, []);
  

  const checkAvailabilityAndPrice = async (id) => {
    const pres = checkoutList.find((p) => p.id === id);
    try {
      const res = await fetch('http://localhost:5000/api/inventory/check-inventory'
        , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicines: pres.medicines,
          doctorSignature: pres.doctorSignature,
          prescriptionId: pres.id,
        }),
      });
      const data = await res.json();
      setCheckoutList((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, medicines: data.medicines, checked: true } : p
        )
      );
    } catch (err) {
      console.error('Error checking inventory:', err);
    }
  };
  
  const sendReceipt = (id) => {
    const pres = checkoutList.find((p) => p.id === id);
    setAwaitingConfirmation((prev) => [...prev, pres]);
    setCheckoutList((prev) => prev.filter((p) => p.id !== id));
  };

  const confirmReceipt = (id) => {
    const pres = awaitingConfirmation.find((p) => p.id === id);
    setConfirmedPrescriptions((prev) => [...prev, pres]);
    setAwaitingConfirmation((prev) => prev.filter((p) => p.id !== id));
  };

  const rejectReceipt = (id) => {
    const pres = awaitingConfirmation.find((p) => p.id === id);
    setRejectedPrescriptions((prev) => [...prev, pres]);
    setAwaitingConfirmation((prev) => prev.filter((p) => p.id !== id));
  };

  const deleteRejected = (id) => {
    setRejectedPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const sendToDelivery = (id) => {
    alert(`Prescription ${id} sent to delivery.`);
    setConfirmedPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const renderTable = (data, actions, title) => (
    <section className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-slate-500 italic">No prescriptions found.</p>
      ) : (
        <table className="min-w-full text-sm border border-slate-200">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">Patient</th>
              <th className="px-4 py-2">Doctor</th>
              <th className="px-4 py-2">Medicines</th>
              <th className="px-4 py-2">Doctor Verification</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((pres) => {
              const total = (pres.medicines ?? []).reduce(
                (sum, m) => sum + (m.available ? (m.price || 0) * (m.quantity || 1) : 0),
                0
              );
              return (
                <tr key={pres.id}>
                  <td className="px-4 py-2">{pres.patient}</td>
                  <td className="px-4 py-2">{pres.doctor}</td>
                  <td className="px-4 py-2">
                    <ul className="list-disc ml-4">
                      {(pres.medicines ?? []).map((med, idx) => (
                        <li key={idx}>
                          {med.name} × {med.quantity}
                          {pres.checked && (
                            <>
                              {' '}—{' '}
                              <span className={med.available ? 'text-green-600' : 'text-red-600'}>
                                {med.available ? `Rs.${med.price}` : med.reason || 'Unavailable'}
                              </span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2">
                    {pres.doctorSignature ? (
                      <span className="text-green-600">✔ Verified ({pres.doctorLicense})</span>
                    ) : (
                      <span className="text-red-600">✖ Not Verified</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-bold text-indigo-600">{total ? `Rs.${total}` : '-'}</td>
                  <td className="px-4 py-2 space-x-2">
                    {actions(pres)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );

  return (
    <RoleLayout title="Prescription Management">
      <div className="min-h-screen bg-slate-50 p-6 space-y-10">
        <header className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Pharmacy Prescription Dashboard</h2>
          <p className="text-slate-500">Review, approve, and process prescriptions with inventory integration.</p>
        </header>

        {renderTable(checkoutList, (pres) => (
          !pres.checked ? (
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-xs"
              onClick={() => checkAvailabilityAndPrice(pres.id)}>
              Check Inventory
            </button>
          ) : (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs"
              onClick={() => sendReceipt(pres.id)}>
              Send Receipt
            </button>
          )
        ), '🧾 Prescriptions Awaiting Checkout')}

        {renderTable(awaitingConfirmation, (pres) => (
          <>
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md text-xs"
              onClick={() => confirmReceipt(pres.id)}>
              Confirm Receipt
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs ml-2"
              onClick={() => rejectReceipt(pres.id)}>
              Reject Receipt
            </button>
          </>
        ), '⏳ Awaiting Patient Confirmation')}

        {renderTable(confirmedPrescriptions, (pres) => (
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-xs"
            onClick={() => sendToDelivery(pres.id)}>
            Send to Delivery
          </button>
        ), '✅ Confirmed Prescriptions')}

        {renderTable(rejectedPrescriptions, (pres) => (
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-xs"
            onClick={() => deleteRejected(pres.id)}>
            Delete Rejected
          </button>
        ), '❌ Rejected Prescriptions')}
      </div>
    </RoleLayout>
  );
};

export default PrescriptionManagement;
