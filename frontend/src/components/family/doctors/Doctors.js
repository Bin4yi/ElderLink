import React, { useEffect, useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import axios from 'axios';
import api from '../../../services/api';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

useEffect(() => {
  const fetchDoctors = async () => {
    try {
      console.log("Fetching doctors from backend API...");
      const response = await api.get('/family/doctors');
      console.log("✅ Doctors fetched:", response.data);
      setDoctors(response.data);
    } catch (error) {
      console.error("❌ Error fetching doctors:", error);
    }
  };

  fetchDoctors();
}, []);



  const handleSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalVisible(true);
  };

  const confirmSelection = async () => {
    try {
      await axios.post('/api/family/select-doctor', {
        doctorId: selectedDoctor.id,
      });
      alert('Doctor selected successfully!');
      setIsModalVisible(false);
    } catch (err) {
      console.error(err);
      alert('Error selecting doctor');
    }
  };

  return (
    <RoleLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Available Doctors</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
              <img
                src={doc.profileImage || '/default-doctor.png'}
                alt="Profile"
                className="w-24 h-24 object-cover rounded-full mb-3"
              />
              <p className="font-semibold">{doc.firstName} {doc.lastName}</p>
              <p className="text-sm text-gray-600">{doc.specialization}</p>
              <p className="text-sm text-gray-500">Experience: {doc.experience} yrs</p>
              <p className="text-sm text-gray-500">Email: {doc.email}</p>
              <p className="text-sm text-gray-500">Phone: {doc.phone}</p>
              <p className="text-sm text-gray-500 mb-2">Available: {doc.availableDays?.join(', ')}</p>
              <button
                onClick={() => handleSelect(doc)}
                className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded text-sm"
              >
                Select Your Doctor
              </button>
            </div>
          ))}
        </div>

        {/* Custom Modal */}
        {isModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Confirm Doctor Selection</h2>
              <p>
                Are you sure you want to select <strong>{selectedDoctor?.firstName} {selectedDoctor?.lastName}</strong> as your doctor?
              </p>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalVisible(false)}
                  className="px-3 py-1 border border-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSelection}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default Doctors;

