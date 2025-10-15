const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PrescriptionItem = sequelize.define('PrescriptionItem', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  prescriptionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'prescriptions',
      key: 'id'
    }
  },
  inventoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'inventories',
      key: 'id'
    }
  },
  medicationName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  genericName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  strength: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantityPrescribed: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantityDispensed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  substitutionAllowed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'filled', 'partially_filled', 'out_of_stock', 'substituted'),
    allowNull: false,
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'prescription_items',
  timestamps: true
});

module.exports = PrescriptionItem;