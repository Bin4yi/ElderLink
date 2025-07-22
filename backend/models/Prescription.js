const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  prescriptionNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
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
  pharmacyId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'filled', 'partially_filled', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'pending'
  },
  issuedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: false
  },
  filledDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal'
  },
  deliveryRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  filledBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'prescriptions',
  timestamps: true
});

module.exports = Prescription;