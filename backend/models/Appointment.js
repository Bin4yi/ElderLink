// backend/models/Appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  familyMemberId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',  // ✅ Correct
      key: 'id'
    }
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Elders',  // ✅ Correct
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',  // ✅ CHANGE THIS from 'Doctors' to 'doctors'
      key: 'id'
    }
  },
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  type: {
    type: DataTypes.ENUM('consultation', 'follow-up', 'emergency'),
    defaultValue: 'consultation'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled', 'no-show', 'reserved'),
    defaultValue: 'pending'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  doctorNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reservedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reservedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  zoomMeetingId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  zoomJoinUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  zoomPassword: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  blockedUntil: {
    type: DataTypes.DATE,
    allowNull: true // Time until which the slot is blocked (15 min window)
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'expired'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'Appointments',
  timestamps: true,
  indexes: [
    {
      fields: ['doctorId', 'appointmentDate']
    },
    {
      fields: ['elderId']
    },
    {
      fields: ['familyMemberId']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Appointment;