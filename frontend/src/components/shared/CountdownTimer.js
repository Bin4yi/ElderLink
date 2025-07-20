// frontend/src/components/shared/CountdownTimer.js
import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

const CountdownTimer = ({ targetDate, onTimeUp, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isActive, setIsActive] = useState(true);

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference
      };
    } else {
      timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0) {
        setIsActive(false);
        if (onTimeUp) onTimeUp();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isActive, onTimeUp, targetDate]);

  const getTimerStatus = () => {
    const oneHourInMs = 60 * 60 * 1000;
    
    if (timeLeft.total <= 0) {
      return {
        status: 'active',
        message: 'Consultation Time!',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle
      };
    } else if (timeLeft.total <= oneHourInMs) {
      return {
        status: 'ready',
        message: 'Ready to join',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: AlertCircle
      };
    } else {
      return {
        status: 'waiting',
        message: 'Time until consultation',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: Clock
      };
    }
  };

  const formatTimeUnit = (value, label) => {
    if (value === 0 && timeLeft.total > 0) return null;
    
    return (
      <div className="text-center">
        <div className="text-2xl font-bold">{value.toString().padStart(2, '0')}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      </div>
    );
  };

  const timerStatus = getTimerStatus();
  const Icon = timerStatus.icon;

  return (
    <div className={`p-4 rounded-lg border ${timerStatus.bgColor} ${timerStatus.borderColor} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${timerStatus.color}`} />
          <span className={`text-sm font-medium ${timerStatus.color}`}>
            {timerStatus.message}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4">
        {timeLeft.total > 0 ? (
          <>
            {timeLeft.days > 0 && formatTimeUnit(timeLeft.days, 'Days')}
            {(timeLeft.days > 0 || timeLeft.hours > 0) && formatTimeUnit(timeLeft.hours, 'Hours')}
            {formatTimeUnit(timeLeft.minutes, 'Min')}
            {timeLeft.total <= 60 * 60 * 1000 && formatTimeUnit(timeLeft.seconds, 'Sec')}
          </>
        ) : (
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">00:00</div>
            <div className="text-xs text-green-600 uppercase tracking-wide">Consultation Active</div>
          </div>
        )}
      </div>

      {/* Progress Bar for last hour */}
      {timeLeft.total <= 60 * 60 * 1000 && timeLeft.total > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${Math.max(0, Math.min(100, 100 - (timeLeft.total / (60 * 60 * 1000) * 100)))}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 hour before</span>
            <span>Consultation time</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;