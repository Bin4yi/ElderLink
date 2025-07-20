import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { 
  Phone, 
  AlertTriangle, 
  Heart,
  Shield,
  Users,
  MapPin,
  Clock,
  Plus,
  Edit,
  Star,
  Zap,
  Stethoscope,
  Car,
  Home,
  User,
  Mail
} from 'lucide-react';

const ElderEmergency = () => {
  const [showAddContact, setShowAddContact] = useState(false);

  // Emergency services
  const emergencyServices = [
    {
      id: 1,
      name: "Emergency (911)",
      number: "911",
      description: "Police, Fire, Medical Emergency",
      icon: AlertTriangle,
      color: "bg-red-600",
      priority: "critical"
    },
    {
      id: 2,
      name: "Poison Control",
      number: "1-800-222-1222",
      description: "24/7 poison emergency hotline",
      icon: Shield,
      color: "bg-orange-600",
      priority: "urgent"
    },
    {
      id: 3,
      name: "National Suicide Prevention",
      number: "988",
      description: "Crisis counseling and mental health support",
      icon: Heart,
      color: "bg-purple-600",
      priority: "urgent"
    }
  ];

  // Personal emergency contacts
  const personalContacts = [
    {
      id: 1,
      name: "Sarah Johnson",
      relationship: "Daughter",
      phone: "+1 (555) 123-4567",
      email: "sarah.johnson@email.com",
      address: "123 Oak Street, Springfield",
      isPrimary: true,
      isLocal: true,
      notes: "Lives 10 minutes away, has house key",
      icon: User,
      availability: "Available 24/7"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      relationship: "Primary Care Doctor",
      phone: "+1 (555) 987-6543",
      email: "m.chen@cityhealthcare.com",
      address: "City Medical Center, 456 Health Blvd",
      isPrimary: false,
      isLocal: true,
      notes: "Cardiologist, knows medical history",
      icon: Stethoscope,
      availability: "Mon-Fri 8AM-6PM"
    },
    {
      id: 3,
      name: "Robert Johnson",
      relationship: "Son",
      phone: "+1 (555) 456-7890",
      email: "rob.johnson@email.com",
      address: "789 Pine Avenue, Portland",
      isPrimary: false,
      isLocal: false,
      notes: "Lives in Portland, backup contact",
      icon: User,
      availability: "Available evenings"
    },
    {
      id: 4,
      name: "Margaret Williams",
      relationship: "Neighbor",
      phone: "+1 (555) 234-5678",
      email: "mwilliams@email.com",
      address: "125 Oak Street, Springfield",
      isPrimary: false,
      isLocal: true,
      notes: "Next door neighbor, very helpful",
      icon: Home,
      availability: "Usually home during day"
    },
    {
      id: 5,
      name: "Springfield Taxi",
      relationship: "Transportation",
      phone: "+1 (555) 345-6789",
      email: "dispatch@springfieldtaxi.com",
      address: "Downtown Springfield",
      isPrimary: false,
      isLocal: true,
      notes: "Reliable transportation service",
      icon: Car,
      availability: "24/7 Service"
    }
  ];

  // Medical information
  const medicalInfo = {
    bloodType: "O+",
    allergies: ["Penicillin", "Shellfish"],
    conditions: ["Hypertension", "Type 2 Diabetes"],
    medications: ["Lisinopril 10mg", "Metformin 500mg"],
    emergencyMedicalContact: "Dr. Michael Chen",
    insurance: "Medicare + Blue Cross Supplement"
  };

  const quickActions = [
    {
      id: 1,
      title: "Call 911",
      description: "Emergency services",
      action: "tel:911",
      icon: AlertTriangle,
      color: "bg-red-600 hover:bg-red-700"
    },
    {
      id: 2,
      title: "Call Primary Contact",
      description: "Sarah Johnson",
      action: "tel:+15551234567",
      icon: Phone,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      id: 3,
      title: "Call Doctor",
      description: "Dr. Michael Chen",
      action: "tel:+15559876543",
      icon: Stethoscope,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      id: 4,
      title: "Medical Alert",
      description: "Share medical info",
      action: "#medical",
      icon: Heart,
      color: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  return (
    <RoleLayout title="Emergency">
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-800 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Shield className="w-8 h-8 mr-3" />
                Emergency Center
              </h1>
              <p className="text-red-100 text-lg">Quick access to help when you need it most</p>
            </div>
            <button 
              onClick={() => setShowAddContact(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            
            return (
              <button
                key={action.id}
                className={`${action.color} text-white rounded-2xl p-6 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl`}
                onClick={() => {
                  if (action.action.startsWith('tel:')) {
                    window.open(action.action);
                  }
                }}
              >
                <IconComponent className="w-8 h-8 mx-auto mb-3" />
                <div className="text-lg font-bold">{action.title}</div>
                <div className="text-sm opacity-90">{action.description}</div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Emergency Services */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
                Emergency Services
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {emergencyServices.map((service) => {
                const IconComponent = service.icon;
                
                return (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`${service.color} rounded-lg p-2 text-white`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      </div>
                      <button 
                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-medium transition-colors flex items-center"
                        onClick={() => window.open(`tel:${service.number}`)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </button>
                    </div>
                    <div className="mt-2 text-lg font-bold text-red-600">
                      {service.number}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Contacts */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-600" />
                Personal Emergency Contacts
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {personalContacts.map((contact) => {
                const IconComponent = contact.icon;
                
                return (
                  <div
                    key={contact.id}
                    className={`border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                      contact.isPrimary 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`rounded-lg p-2 text-white ${
                          contact.isPrimary ? 'bg-blue-600' : 'bg-gray-500'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-lg font-semibold text-gray-900">{contact.name}</h4>
                            {contact.isPrimary && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                              {contact.relationship}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-2" />
                              {contact.phone}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-2" />
                              {contact.availability}
                            </div>
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-2" />
                              {contact.email}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-2" />
                              {contact.isLocal ? 'Local' : 'Out of area'}
                            </div>
                          </div>
                          
                          {contact.notes && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-700">{contact.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-medium transition-colors flex items-center"
                          onClick={() => window.open(`tel:${contact.phone}`)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </button>
                        <button className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg p-2 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Medical Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Heart className="w-6 h-6 mr-3 text-purple-600" />
              Emergency Medical Information
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Blood Type:</span> <span className="font-medium">{medicalInfo.bloodType}</span></div>
                  <div><span className="text-gray-600">Insurance:</span> <span className="font-medium">{medicalInfo.insurance}</span></div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Allergies & Conditions</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 text-sm">Allergies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {medicalInfo.allergies.map((allergy, index) => (
                        <span key={index} className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Conditions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {medicalInfo.conditions.map((condition, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Current Medications</h4>
                <div className="space-y-1">
                  {medicalInfo.medications.map((medication, index) => (
                    <div key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                      {medication}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-3 font-medium transition-colors flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Share Medical Info in Emergency
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};


export default ElderEmergency;