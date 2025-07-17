import React, { useEffect, useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { 
  User, 
  Star, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Award,
  Stethoscope,
  Search,
  Filter
} from 'lucide-react';
import api from '../../../services/api';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log("Fetching doctors from backend API...");
        setLoading(true);
        
        // ✅ Fixed: Use the correct endpoint
        const response = await api.get('/appointments/doctors');
        console.log("✅ Doctors fetched:", response.data);
        
        // ✅ Handle the response structure properly
        if (response.data && response.data.success) {
          setDoctors(response.data.doctors || []);
        } else {
          console.warn('⚠️ No doctors found in response');
          setDoctors([]);
        }
      } catch (error) {
        console.error("❌ Error fetching doctors:", error);
        console.error("❌ Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setDoctors([]);
      } finally {
        setLoading(false);
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
      // ✅ Fixed: Use correct API endpoint and structure
      const response = await api.post('/family/select-doctor', {
        doctorId: selectedDoctor.id,
      });
      
      if (response.data.success) {
        alert('Doctor selected successfully!');
      } else {
        alert('Error selecting doctor: ' + response.data.message);
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error selecting doctor:', error);
      alert('Error selecting doctor: ' + (error.response?.data?.message || error.message));
    }
  };

  // ✅ Filter doctors based on search and specialization
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchTerm || 
      `${doctor.user?.firstName} ${doctor.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = filterSpecialization === 'all' || 
      doctor.specialization === filterSpecialization;
    
    return matchesSearch && matchesSpecialization;
  });

  // ✅ Get unique specializations for filter
  const specializations = [...new Set(doctors.map(doc => doc.specialization).filter(Boolean))];

  // ✅ Loading state
  if (loading) {
    return (
      <RoleLayout title="Available Doctors">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="Available Doctors">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Stethoscope className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Available Doctors</h1>
                <p className="text-gray-600">Choose your preferred doctor for consultations</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search doctors by name or specialization..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterSpecialization}
                  onChange={(e) => setFilterSpecialization(e.target.value)}
                >
                  <option value="all">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No doctors available at the moment.</p>
              <p className="text-gray-400 mt-2">Please try again later or contact support.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Doctor Profile */}
                    <div className="flex items-center mb-4">
                      {doctor.user?.profileImage ? (
                        <img
                          src={doctor.user.profileImage}
                          alt={`Dr. ${doctor.user.firstName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-blue-600" />
                        </div>
                      )}
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                        </h3>
                        <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">
                            {doctor.rating || '4.5'} Rating
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Award className="w-4 h-4 mr-2" />
                        <span className="text-sm">{doctor.experience} years experience</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="text-sm">{doctor.user?.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span className="text-sm">{doctor.user?.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">Fee: ${doctor.consultationFee}</span>
                      </div>
                    </div>

                    {/* Verification Badge */}
                    {doctor.verificationStatus === 'verified' && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Award className="w-3 h-3 mr-1" />
                          Verified Doctor
                        </span>
                      </div>
                    )}

                    {/* Select Button */}
                    <button
                      onClick={() => handleSelect(doctor)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Select Doctor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal */}
      {isModalVisible && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Doctor Selection</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                {selectedDoctor.user?.profileImage ? (
                  <img
                    src={selectedDoctor.user.profileImage}
                    alt={`Dr. ${selectedDoctor.user.firstName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">
                    Dr. {selectedDoctor.user?.firstName} {selectedDoctor.user?.lastName}
                  </p>
                  <p className="text-sm text-blue-600">{selectedDoctor.specialization}</p>
                  <p className="text-sm text-gray-600">{selectedDoctor.experience} years experience</p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to select this doctor as your preferred healthcare provider?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalVisible(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSelection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
};

export default Doctors;

