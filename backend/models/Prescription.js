// backend/models/Prescription.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  consultationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ConsultationRecords',
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
  prescriptionNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  medications: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  validUntil: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled'),
    defaultValue: 'active'
  },
  digitalSignature: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prescriptionFile: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (prescription) => {
      if (!prescription.prescriptionNumber) {
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        prescription.prescriptionNumber = `RX${timestamp}${random}`;
      }
    }
  }
});

module.exports = Prescription;