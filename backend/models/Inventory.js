const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  pharmacyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  genericName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 
      'inhaler', 'patch', 'gel', 'powder', 'suspension', 'other'
    ),
    allowNull: false,
    defaultValue: 'tablet'
  },
  strength: {
    type: DataTypes.STRING,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.ENUM('pieces', 'bottles', 'boxes', 'strips', 'tubes', 'vials', 'packets'),
    allowNull: false,
    defaultValue: 'pieces'
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  expirationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  batchNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  manufacturerDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'A1-01'
  },
  minStockLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  prescriptionRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sideEffects: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dosageInstructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  storageConditions: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Store in cool, dry place'
  },
  status: {
    type: DataTypes.ENUM('active', 'discontinued', 'out_of_stock', 'expired'),
    allowNull: false,
    defaultValue: 'active'
  },
  totalSold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lastRestocked: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'inventories',
  timestamps: true
  // Removed indexes to avoid conflicts
});

module.exports = Inventory;