import React, { useState } from 'react';
import {
  FileText,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Eye,
  BarChart3,
  Pill,
  Stethoscope
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout'; // <-- Add this import

const FamilyHealthReports = () => {
  const [selectedElder, setSelectedElder] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Dummy health reports data
  const elders = [
    { id: 'margaret', name: 'Margaret Johnson', relationship: 'Mother' },
    { id: 'robert', name: 'Robert Johnson Sr.', relationship: 'Father' }
  ];

  const healthReports = [
    {
      id: 1,
      elderName: 'Margaret Johnson',
      elderId: 'margaret',
      date: '2025-07-20',
      type: 'Daily Summary',
      status: 'normal',
      vitals: {
        bloodPressure: { value: '128/82', status: 'normal', trend: 'stable' },
        heartRate: { value: '74 bpm', status: 'normal', trend: 'up' },
        temperature: { value: '98.4°F', status: 'normal', trend: 'stable' },
        oxygenSat: { value: '97%', status: 'normal', trend: 'stable' }
      },
      medications: { taken: 3, missed: 0, total: 3 },
      activities: { completed: 2, total: 3 },
      mood: { score: 8, note: 'Feeling well today' },
      alerts: []
    },
    {
      id: 2,
      elderName: 'Robert Johnson Sr.',
      elderId: 'robert',
      date: '2025-07-20',
      type: 'Daily Summary',
      status: 'warning',
      vitals: {
        bloodPressure: { value: '145/92', status: 'high', trend: 'up' },
        heartRate: { value: '88 bpm', status: 'elevated', trend: 'up' },
        temperature: { value: '98.1°F', status: 'normal', trend: 'stable' },
        oxygenSat: { value: '95%', status: 'low', trend: 'down' }
      },
      medications: { taken: 2, missed: 1, total: 3 },
      activities: { completed: 1, total: 3 },
      mood: { score: 6, note: 'Feeling tired' },
      alerts: ['Missed afternoon medication', 'Blood pressure elevated']
    },
    {
      id: 3,
      elderName: 'Margaret Johnson',
      elderId: 'margaret',
      date: '2025-07-19',
      type: 'Weekly Summary',
      status: 'good',
      vitals: {
        bloodPressure: { value: '125/80', status: 'normal', trend: 'stable' },
        heartRate: { value: '72 bpm', status: 'normal', trend: 'stable' },
        temperature: { value: '98.2°F', status: 'normal', trend: 'stable' },
        oxygenSat: { value: '98%', status: 'normal', trend: 'up' }
      },
      medications: { taken: 20, missed: 1, total: 21 },
      activities: { completed: 15, total: 21 },
      mood: { score: 7.5, note: 'Generally positive week' },
      alerts: []
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': 
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal':
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-600" />;
      case 'stable': return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  const getVitalStatus = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'elevated':
      case 'high': return 'text-yellow-600';
      case 'low':
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredReports = healthReports.filter(report => 
    selectedElder === 'all' || report.elderId === selectedElder
  );

  return (
    <RoleLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <FileText className="w-8 h-8 mr-3" />
                Family Health Reports
              </h1>
              <p className="text-red-100 text-lg">Monitor your elders' health status and trends</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105">
              <Download className="w-5 h-5 mr-2" />
              Export Reports
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-red-600">{elders.length}</div>
            <div className="text-red-500 font-medium">Total Elders</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredReports.filter(r => r.status === 'normal' || r.status === 'good').length}
            </div>
            <div className="text-green-500 font-medium">Healthy Reports</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredReports.filter(r => r.status === 'warning').length}
            </div>
            <div className="text-yellow-500 font-medium">Warnings</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-600">{filteredReports.length}</div>
            <div className="text-blue-500 font-medium">Total Reports</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filter reports:</span>
              <select 
                value={selectedElder}
                onChange={(e) => setSelectedElder(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Elders</option>
                {elders.map(elder => (
                  <option key={elder.id} value={elder.id}>{elder.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">Period:</span>
              {['day', 'week', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${
                    selectedPeriod === period
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Health Reports */}
        <div className="space-y-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Report Header */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{report.elderName}</h3>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{report.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(report.status)}
                        <span className="capitalize">{report.status}</span>
                      </div>
                    </span>
                    <button className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-medium transition-colors flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Vital Signs */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-red-600" />
                      Vital Signs
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(report.vitals).map(([key, vital]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600 capitalize">
                              {key === 'oxygenSat' ? 'Oxygen Sat' : key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            {getTrendIcon(vital.trend)}
                          </div>
                          <div className={`text-lg font-bold ${getVitalStatus(vital.status)}`}>
                            {vital.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
                      Daily Summary
                    </h4>
                    <div className="space-y-4">
                      {/* Medications */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 flex items-center">
                            <Pill className="w-4 h-4 mr-1" />
                            Medications
                          </span>
                          <span className="text-xs text-gray-500">
                            {report.medications.taken}/{report.medications.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(report.medications.taken / report.medications.total) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Activities */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 flex items-center">
                            <Activity className="w-4 h-4 mr-1" />
                            Activities
                          </span>
                          <span className="text-xs text-gray-500">
                            {report.activities.completed}/{report.activities.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(report.activities.completed / report.activities.total) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Mood */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Mood Score</span>
                          <span className="text-lg font-bold text-purple-600">{report.mood.score}/10</span>
                        </div>
                        <p className="text-xs text-gray-600 italic">"{report.mood.note}"</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                {report.alerts.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="font-medium text-yellow-900 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Alerts & Notifications
                    </h5>
                    <ul className="space-y-1">
                      {report.alerts.map((alert, index) => (
                        <li key={index} className="text-sm text-yellow-800">• {alert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <FileText className="w-16 h-16 mx-auto text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">No Reports Found</h3>
              <p className="text-red-600">No health reports match the selected criteria.</p>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default FamilyHealthReports;