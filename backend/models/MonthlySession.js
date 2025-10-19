// backend/models/MonthlySession.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MonthlySession = sequelize.define('MonthlySession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Elders',
      key: 'id'
    }
  },
  familyMemberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  scheduleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'doctor_schedules',
      key: 'id'
    }
  },
  sessionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  sessionTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 45,
    comment: 'Duration in minutes'
  },
  status: {
    type: DataTypes.ENUM(
      'scheduled',
      'in-progress',
      'completed',
      'cancelled',
      'missed',
      'rescheduled'
    ),
    defaultValue: 'scheduled'
  },
  sessionType: {
    type: DataTypes.ENUM('initial', 'regular', 'follow-up'),
    defaultValue: 'regular'
  },
  isAutoScheduled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this session was auto-scheduled by the system'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  familyNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from family member'
  },
  doctorNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from doctor after session'
  },
  sessionSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Summary of the session (vitals, observations, etc.)'
  },
  vitalSigns: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'JSON object containing vital signs recorded during session'
  },
  prescriptions: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'JSON array of prescriptions given during session'
  },
  nextSessionDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Suggested date for next monthly session'
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rescheduledFrom: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'monthly_sessions',
      key: 'id'
    },
    comment: 'Original session ID if this is a rescheduled session'
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reminderSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sessionDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Actual session duration in minutes'
  },
  zoomMeetingId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  zoomJoinUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  zoomStartUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'URL for doctor to start the meeting'
  },
  zoomPassword: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'monthly_sessions',
  timestamps: true,
  indexes: [
    {
      fields: ['elderId']
    },
    {
      fields: ['doctorId']
    },
    {
      fields: ['sessionDate']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['elderId', 'sessionDate'],
      name: 'unique_elder_session_date'
    }
  ]
});

module.exports = MonthlySession;
