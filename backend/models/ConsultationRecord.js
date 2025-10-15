// backend/models/ConsultationRecord.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConsultationRecord = sequelize.define('ConsultationRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Appointments',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',  // ✅ Change from 'Doctors' to 'doctors'
      key: 'id'
    }
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Elders',
      key: 'id'
    }
  },
  sessionDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nextAppointment: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  vitalSigns: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sessionSummary: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  prescriptionAttached: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('completed', 'in-progress', 'cancelled'),
    defaultValue: 'completed'
  }
});


module.exports = ConsultationRecord;