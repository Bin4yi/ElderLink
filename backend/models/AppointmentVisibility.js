// backend/models/AppointmentVisibility.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentVisibility = sequelize.define('AppointmentVisibility', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'appointment_id',
    references: {
      model: 'Appointments',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  allowMedicalRecordAccess: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'allow_medical_record_access',
    comment: 'Whether doctor can access elder\'s medical history and vitals (1=allowed, 0=denied)'
  },
  grantedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'granted_by',
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'Family member who granted/denied access'
  },
  grantedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'granted_at'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Optional notes about access decision'
  }
}, {
  tableName: 'AppointmentVisibility',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['appointment_id']
    },
    {
      fields: ['granted_by']
    }
  ]
});

module.exports = AppointmentVisibility;
