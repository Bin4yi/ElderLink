// src/components/doctor/consultations/ConsultationCalendar.js
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const ConsultationCalendar = ({ appointments = [], monthlySessions = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = new Date(year, month, date).toISOString().split('T')[0];
    
    const dayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
      return aptDate === dateStr;
    });

    const daySessions = monthlySessions.filter(session => {
      const sessionDate = new Date(session.sessionDate).toISOString().split('T')[0];
      return sessionDate === dateStr;
    });

    return { appointments: dayAppointments, sessions: daySessions };
  };

  const isToday = (date) => {
    return date === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50"></div>);
    }

    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const events = getEventsForDate(date);
      const hasAppointments = events.appointments.length > 0;
      const hasSessions = events.sessions.length > 0;
      const isTodayDate = isToday(date);

      days.push(
        <div
          key={date}
          className={`h-24 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isTodayDate ? 'bg-blue-50 border-blue-500 border-2' : ''
          }`}
        >
          <div className={`text-sm font-semibold mb-1 ${
            isTodayDate ? 'text-blue-600' : 'text-gray-700'
          }`}>
            {date}
            {isTodayDate && <span className="ml-1 text-xs">Today</span>}
          </div>
          
          <div className="space-y-1">
            {/* Monthly Sessions */}
            {hasSessions && events.sessions.map((session, idx) => (
              <div
                key={`session-${idx}`}
                className="text-xs px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full truncate"
                title={`Session: ${session.elder?.firstName} ${session.elder?.lastName} at ${session.sessionTime}`}
              >
                🗓️ {session.sessionTime?.substring(0, 5)}
              </div>
            ))}

            {/* Appointments */}
            {hasAppointments && events.appointments.slice(0, 2).map((apt, idx) => (
              <div
                key={`apt-${idx}`}
                className="text-xs px-2 py-1 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full truncate"
                title={`Appointment: ${apt.elder?.firstName} ${apt.elder?.lastName} at ${apt.appointmentTime}`}
              >
                🏥 {apt.appointmentTime?.substring(0, 5)}
              </div>
            ))}

            {/* Show "+X more" if there are more than 2 appointments */}
            {hasAppointments && events.appointments.length > 2 && (
              <div className="text-xs text-gray-600 font-semibold">
                +{events.appointments.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-200 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {monthNames[month]} {year}
            </h3>
            <p className="text-sm text-gray-600">Schedule Overview</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
          <span className="text-gray-600">Monthly Sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded"></div>
          <span className="text-gray-600">Appointments</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-gray-300 rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-blue-500 to-indigo-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-3 text-sm font-semibold text-white">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{monthlySessions.length}</div>
          <div className="text-sm text-gray-600">Monthly Sessions</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
          <div className="text-2xl font-bold text-indigo-600">{appointments.length}</div>
          <div className="text-sm text-gray-600">Total Appointments</div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationCalendar;
