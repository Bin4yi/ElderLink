import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { 
  Pill, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Bell,
  Info,
  Droplets,
  Heart,
  Shield,
  Zap,
  Loader,
  RefreshCw,
  User
} from 'lucide-react';
import prescriptionService from '../../../services/prescription';
import toast from 'react-hot-toast';

const ElderMedications = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading elder medications...');
      
      const response = await prescriptionService.getElderMedications();
      console.log('📋 Medications response:', response);

      if (response.success) {
        setPrescriptions(response.prescriptions || []);
        
        // Transform prescriptions into medication items
        const meds = [];
        (response.prescriptions || []).forEach(prescription => {
          (prescription.items || []).forEach(item => {
            meds.push({
              id: item.id,
              prescriptionId: prescription.id,
              prescriptionNumber: prescription.prescriptionNumber,
              name: item.medicationName,
              genericName: item.genericName,
              dosage: item.strength || item.dosage,
              frequency: item.frequency,
              instructions: item.instructions,
              quantityPrescribed: item.quantityPrescribed,
              quantityDispensed: item.quantityDispensed || 0,
              remainingPills: item.quantityDispensed ? (item.quantityDispensed - (item.quantityUsed || 0)) : item.quantityPrescribed,
              totalPills: item.quantityDispensed || item.quantityPrescribed,
              status: prescription.status,
              prescriptionStatus: prescription.status,
              issuedDate: prescription.issuedDate,
              validUntil: prescription.validUntil,
              priority: prescription.priority,
              notes: prescription.notes || item.notes,
              prescriber: prescription.doctor ? 
                `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` : 
                'Unknown Doctor',
              doctorSpecialization: prescription.doctor?.doctorProfile?.specialization || 'General Medicine',
              icon: getIconForMedication(item.medicationName)
            });
          });
        });
        
        setMedications(meds);
        console.log('✅ Loaded medications:', meds.length);
      }
    } catch (error) {
      console.error('❌ Error loading medications:', error);
      toast.error('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const getIconForMedication = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('heart') || nameLower.includes('cardiac')) return Heart;
    if (nameLower.includes('blood') || nameLower.includes('pressure')) return Droplets;
    if (nameLower.includes('vitamin') || nameLower.includes('supplement')) return Zap;
    if (nameLower.includes('immune') || nameLower.includes('antibio')) return Shield;
    return Pill;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'filled': return 'bg-green-100 text-green-800 border-green-200';
      case 'partially_filled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'filled': return <CheckCircle className="w-4 h-4" />;
      case 'partially_filled': return <AlertTriangle className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      case 'expired': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const filteredMedications = medications.filter(med => 
    selectedFilter === 'all' || med.prescriptionStatus === selectedFilter
  );

  const getPillProgress = (remaining, total) => {
    if (!total) return 0;
    return Math.max((remaining / total) * 100, 0);
  };

  if (loading) {
    return (
      <RoleLayout title="My Medications">
        <div className="max-w-6xl mx-auto p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your medications...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="My Medications">
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Pill className="w-8 h-8 mr-3" />
                My Medications
              </h1>
              <p className="text-blue-100 text-lg">Track and manage your prescribed medications</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={loadMedications}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-600">{medications.length}</div>
            <div className="text-blue-500 font-medium">Total Medications</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-green-600">
              {medications.filter(m => m.prescriptionStatus === 'filled').length}
            </div>
            <div className="text-green-500 font-medium">Filled</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {medications.filter(m => m.prescriptionStatus === 'pending').length}
            </div>
            <div className="text-yellow-500 font-medium">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-red-600">
              {medications.filter(m => m.prescriptionStatus === 'expired').length}
            </div>
            <div className="text-red-500 font-medium">Expired</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <Pill className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filter medications:</span>
            <div className="flex space-x-2">
              {['all', 'pending', 'filled', 'partially_filled', 'expired'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${
                    selectedFilter === filter
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Medications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMedications.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-200">
              <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Medications Found</h3>
              <p className="text-gray-500">No medications match your current filter.</p>
            </div>
          ) : (
            filteredMedications.map((medication) => {
              const IconComponent = medication.icon;
              const progress = getPillProgress(medication.remainingPills, medication.totalPills);
              
              return (
                <div
                  key={medication.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 rounded-xl p-2">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{medication.name}</h3>
                          <p className="text-white/80 text-sm">{medication.dosage} • {medication.frequency}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(medication.prescriptionStatus)} bg-white`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(medication.prescriptionStatus)}
                          <span className="capitalize">{medication.prescriptionStatus.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Prescribed by:
                        </span>
                        <p className="font-medium text-gray-900">{medication.prescriber}</p>
                        <p className="text-xs text-gray-500">{medication.doctorSpecialization}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Prescription:
                        </span>
                        <p className="font-medium text-gray-900">#{medication.prescriptionNumber}</p>
                        <p className="text-xs text-gray-500">
                          Issued: {new Date(medication.issuedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {medication.genericName && (
                      <div className="text-sm">
                        <span className="text-gray-500">Generic Name:</span>
                        <p className="font-medium text-gray-900">{medication.genericName}</p>
                      </div>
                    )}

                    {/* Instructions */}
                    {medication.instructions && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Info className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Instructions</span>
                        </div>
                        <p className="text-blue-700 text-sm">{medication.instructions}</p>
                      </div>
                    )}

                    {/* Pill Count & Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Quantity</span>
                        <span className="text-sm text-gray-500">
                          {medication.remainingPills} of {medication.totalPills} remaining
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            progress > 50 ? 'bg-green-500' : 
                            progress > 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Valid Until */}
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-500">Valid Until:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(medication.validUntil).toLocaleDateString()}
                      </span>
                    </div>

                    {medication.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <strong>Notes:</strong> {medication.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default ElderMedications;