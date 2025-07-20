import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Video, 
  Plus,
  Filter,
  ChevronRight,
  Stethoscope,
  Heart,
  Eye,
  Brain
} from 'lucide-react';

const ElderAppointments = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Dummy appointment data
  const appointments = [
    {
      id: 1,
      title: "General Checkup",
      doctor: "Dr. Sarah Johnson",
      specialty: "Family Medicine",
      date: "2025-07-22",
      time: "10:00 AM",
      duration: "30 min",
      type: "in-person",
      location: "City Medical Center, Room 205",
      phone: "+1 (555) 123-4567",
      status: "confirmed",
      icon: Stethoscope,
      notes: "Annual physical examination and health screening"
    },
    {
      id: 2,
      title: "Cardiology Consultation",
      doctor: "Dr. Michael Chen",
      specialty: "Cardiology",
      date: "2025-07-25",
      time: "2:30 PM",
      duration: "45 min",
      type: "video",
      location: "Video Call",
      phone: "+1 (555) 987-6543",
      status: "confirmed",
      icon: Heart,
      notes: "Follow-up on heart rhythm monitoring results"
    },
    {
      id: 3,
      title: "Eye Examination",
      doctor: "Dr. Lisa Rodriguez",
      specialty: "Ophthalmology",
      date: "2025-07-28",
      time: "11:15 AM",
      duration: "60 min",
      type: "in-person",
      location: "Vision Care Clinic, 2nd Floor",
      phone: "+1 (555) 456-7890",
      status: "pending",
      icon: Eye,
      notes: "Routine eye exam and vision prescription update"
    },
    {
      id: 4,
      title: "Memory Assessment",
      doctor: "Dr. Robert Kim",
      specialty: "Neurology",
      date: "2025-08-02",
      time: "9:00 AM",
      duration: "90 min",
      type: "in-person",
      location: "Neurology Department, Building B",
      phone: "+1 (555) 234-5678",
      status: "confirmed",
      icon: Brain,
      notes: "Cognitive function evaluation and memory testing"
    },
    {
      id: 5,
      title: "Physical Therapy",
      doctor: "Dr. Amanda White",
      specialty: "Physical Therapy",
      date: "2025-08-05",
      time: "3:00 PM",
      duration: "45 min",
      type: "in-person",
      location: "Rehabilitation Center, Ground Floor",
      phone: "+1 (555) 345-6789",
      status: "confirmed",
      icon: User,
      notes: "Knee rehabilitation and mobility exercises"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'video' ? Video : MapPin;
  };

  const filteredAppointments = appointments.filter(apt => 
    selectedFilter === 'all' || apt.status === selectedFilter
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <RoleLayout title="My Appointments">
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Calendar className="w-8 h-8 mr-3" />
                My Appointments
              </h1>
              <p className="text-red-100 text-lg">Manage your healthcare schedule</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              Book New
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-red-600">{appointments.length}</div>
            <div className="text-red-500 font-medium">Total Appointments</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(a => a.status === 'confirmed').length}
            </div>
            <div className="text-green-500 font-medium">Confirmed</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(a => a.status === 'pending').length}
            </div>
            <div className="text-yellow-500 font-medium">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(a => a.type === 'video').length}
            </div>
            <div className="text-blue-500 font-medium">Video Calls</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filter by status:</span>
              <div className="flex space-x-2">
                {['all', 'confirmed', 'pending'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${
                      selectedFilter === filter
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const IconComponent = appointment.icon;
            const TypeIcon = getTypeIcon(appointment.type);
            
            return (
              <div
                key={appointment.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-xl p-3">
                        <IconComponent className="w-6 h-6 text-red-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{appointment.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600">
                              <User className="w-4 h-4 mr-2 text-red-500" />
                              <span className="font-medium">{appointment.doctor}</span>
                              <span className="text-gray-400 ml-2">• {appointment.specialty}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-red-500" />
                              <span>{formatDate(appointment.date)} at {appointment.time}</span>
                              <span className="text-gray-400 ml-2">• {appointment.duration}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <TypeIcon className="w-4 h-4 mr-2 text-red-500" />
                              <span>{appointment.location}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600">
                              <Phone className="w-4 h-4 mr-2 text-red-500" />
                              <span>{appointment.phone}</span>
                            </div>
                            
                            {appointment.notes && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600">{appointment.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105 shadow-lg">
                      <span className="mr-2">View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Quick Actions Bar */}
                <div className="bg-gradient-to-r from-gray-50 to-red-50 px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                      <button className="text-red-600 hover:text-red-700 font-medium transition-colors">
                        Reschedule
                      </button>
                      <button className="text-red-600 hover:text-red-700 font-medium transition-colors">
                        Cancel
                      </button>
                      {appointment.type === 'video' && (
                        <button className="text-red-600 hover:text-red-700 font-medium transition-colors">
                          Join Call
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.type === 'video' ? '📹 Video Call' : '🏥 In-Person'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <Calendar className="w-16 h-16 mx-auto text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">No appointments found</h3>
              <p className="text-red-600">No appointments match the selected filter.</p>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default ElderAppointments;