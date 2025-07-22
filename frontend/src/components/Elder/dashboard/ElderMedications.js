import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';

const ElderMedications = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Dummy medication data
  const medications = [
    {
      id: 1,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      timeSlots: ["8:00 AM"],
      purpose: "Blood pressure control",
      prescriber: "Dr. Sarah Johnson",
      startDate: "2025-01-15",
      endDate: "2025-12-31",
      remainingPills: 28,
      totalPills: 30,
      status: "active",
      nextDose: "Tomorrow 8:00 AM",
      sideEffects: ["Dizziness", "Dry cough"],
      instructions: "Take with or without food",
      color: "bg-blue-500",
      icon: Heart
    },
    {
      id: 2,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      timeSlots: ["8:00 AM", "6:00 PM"],
      purpose: "Type 2 diabetes management",
      prescriber: "Dr. Michael Chen",
      startDate: "2024-06-01",
      endDate: "Ongoing",
      remainingPills: 45,
      totalPills: 60,
      status: "active",
      nextDose: "Today 6:00 PM",
      sideEffects: ["Nausea", "Stomach upset"],
      instructions: "Take with meals to reduce stomach upset",
      color: "bg-green-500",
      icon: Droplets
    },
    {
      id: 3,
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily",
      timeSlots: ["10:00 PM"],
      purpose: "Cholesterol management",
      prescriber: "Dr. Sarah Johnson",
      startDate: "2024-11-01",
      endDate: "2025-11-01",
      remainingPills: 15,
      totalPills: 30,
      status: "low",
      nextDose: "Today 10:00 PM",
      sideEffects: ["Muscle pain", "Headache"],
      instructions: "Take at bedtime",
      color: "bg-purple-500",
      icon: Shield
    },
    {
      id: 4,
      name: "Vitamin D3",
      dosage: "1000 IU",
      frequency: "Once daily",
      timeSlots: ["8:00 AM"],
      purpose: "Bone health support",
      prescriber: "Dr. Lisa Rodriguez",
      startDate: "2024-12-01",
      endDate: "2025-12-01",
      remainingPills: 85,
      totalPills: 90,
      status: "active",
      nextDose: "Tomorrow 8:00 AM",
      sideEffects: ["None reported"],
      instructions: "Take with fatty meal for better absorption",
      color: "bg-yellow-500",
      icon: Zap
    },
    {
      id: 5,
      name: "Aspirin",
      dosage: "81mg",
      frequency: "Once daily",
      timeSlots: ["8:00 AM"],
      purpose: "Heart attack prevention",
      prescriber: "Dr. Michael Chen",
      startDate: "2024-03-15",
      endDate: "Ongoing",
      remainingPills: 5,
      totalPills: 30,
      status: "critical",
      nextDose: "Tomorrow 8:00 AM",
      sideEffects: ["Stomach irritation"],
      instructions: "Take with food",
      color: "bg-red-500",
      icon: Heart
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'low': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const filteredMedications = medications.filter(med => 
    selectedFilter === 'all' || med.status === selectedFilter
  );

  const getPillProgress = (remaining, total) => {
    return Math.max((remaining / total) * 100, 0);
  };

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
              <p className="text-blue-100 text-lg">Track and manage your daily medications</p>
            </div>
            <div className="flex space-x-4">
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105">
                <Bell className="w-5 h-5 mr-2" />
                Set Reminder
              </button>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105">
                <Plus className="w-5 h-5 mr-2" />
                Add New
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
              {medications.filter(m => m.status === 'active').length}
            </div>
            <div className="text-green-500 font-medium">Active</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {medications.filter(m => m.status === 'low').length}
            </div>
            <div className="text-yellow-500 font-medium">Low Stock</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-red-600">
              {medications.filter(m => m.status === 'critical').length}
            </div>
            <div className="text-red-500 font-medium">Need Refill</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <Pill className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filter medications:</span>
            <div className="flex space-x-2">
              {['all', 'active', 'low', 'critical'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${
                    selectedFilter === filter
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Medications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMedications.map((medication) => {
            const IconComponent = medication.icon;
            const progress = getPillProgress(medication.remainingPills, medication.totalPills);
            
            return (
              <div
                key={medication.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className={`${medication.color} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 rounded-xl p-2">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{medication.name}</h3>
                        <p className="text-white/80">{medication.dosage} • {medication.frequency}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(medication.status)} bg-white`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(medication.status)}
                        <span className="capitalize">{medication.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Purpose:</span>
                      <p className="font-medium text-gray-900">{medication.purpose}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Prescribed by:</span>
                      <p className="font-medium text-gray-900">{medication.prescriber}</p>
                    </div>
                  </div>

                  {/* Next Dose */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Next Dose</span>
                    </div>
                    <p className="text-blue-700">{medication.nextDose}</p>
                  </div>

                  {/* Pill Count & Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Pills Remaining</span>
                      <span className="text-sm text-gray-500">
                        {medication.remainingPills} of {medication.totalPills}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          progress > 50 ? 'bg-green-500' : 
                          progress > 25 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(progress, 5)}%` }}
                      />
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Daily Schedule</span>
                    <div className="flex flex-wrap gap-2">
                      {medication.timeSlots.map((time, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-1">Instructions</h4>
                    <p className="text-sm text-gray-600">{medication.instructions}</p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm">
                      View Details
                    </button>
                    <div className="flex space-x-4">
                      <button className="text-gray-600 hover:text-gray-700 transition-colors text-sm">
                        Edit
                      </button>
                      <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm">
                        Mark Taken
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredMedications.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 max-w-md mx-auto">
              <Pill className="w-16 h-16 mx-auto text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">No medications found</h3>
              <p className="text-blue-600">No medications match the selected filter.</p>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default ElderMedications;