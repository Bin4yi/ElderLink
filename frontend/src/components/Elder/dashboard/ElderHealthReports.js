import React, { useEffect, useState } from 'react';
import { elderService } from '../../../services/elder';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import { Shield, AlertTriangle, Calendar, Activity, TrendingUp, Users } from 'lucide-react';

const ElderHealthReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      // Example: fetch today's report
      const today = new Date().toISOString().split('T')[0];
      const response = await elderService.getDailyHealthReport(today);
      if (response.success) setReport(response.data);
      setLoading(false);
    };
    fetchReport();
  }, []);

  if (loading) return <Loading text="Loading health report..." />;
  
  if (!report) return (
    <div className="flex flex-col items-center justify-center min-h-96 p-8">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-md">
        <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
        <h3 className="text-lg font-semibold text-amber-800 mb-2">No Data Available</h3>
        <p className="text-amber-600">No health report data found for today.</p>
      </div>
    </div>
  );

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-700';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'normal': return 'bg-green-50 border-green-200 text-green-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'normal': return '✅';
      default: return '📊';
    }
  };

  return (
    <RoleLayout title="My Health Reports">
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Shield className="w-8 h-8 mr-3" />
                Daily Health Report
              </h1>
              <div className="flex items-center text-purple-100">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="text-lg">{report.summary.date}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{report.summary.totalRecords}</div>
              <div className="text-purple-200">Total Records</div>
            </div>
          </div>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-xl border-2 p-6 transition-transform hover:scale-105 ${getAlertColor('critical')}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{report.summary.criticalAlerts}</div>
                <div className="text-sm font-medium">Critical Alerts</div>
              </div>
              <div className="text-2xl">{getAlertIcon('critical')}</div>
            </div>
          </div>

          <div className={`rounded-xl border-2 p-6 transition-transform hover:scale-105 ${getAlertColor('warning')}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{report.summary.warningAlerts}</div>
                <div className="text-sm font-medium">Warning Alerts</div>
              </div>
              <div className="text-2xl">{getAlertIcon('warning')}</div>
            </div>
          </div>

          <div className={`rounded-xl border-2 p-6 transition-transform hover:scale-105 ${getAlertColor('normal')}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{report.summary.normalAlerts}</div>
                <div className="text-sm font-medium">Normal Alerts</div>
              </div>
              <div className="text-2xl">{getAlertIcon('normal')}</div>
            </div>
          </div>
        </div>

        {/* Vital Statistics */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Activity className="w-6 h-6 mr-3 text-blue-600" />
              Vital Statistics Overview
            </h3>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(report.statistics).map(([key, stats]) => (
                <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {stats.count} records
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.average}</div>
                      <div className="text-xs text-gray-500 font-medium">Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.min}</div>
                      <div className="text-xs text-gray-500 font-medium">Minimum</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{stats.max}</div>
                      <div className="text-xs text-gray-500 font-medium">Maximum</div>
                    </div>
                  </div>
                  
                  {/* Visual indicator bar */}
                  <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-full rounded-full"
                      style={{
                        width: `${Math.min((stats.average / stats.max) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4">
          <p>Report generated automatically • Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </RoleLayout>
  );
};

export default ElderHealthReports;