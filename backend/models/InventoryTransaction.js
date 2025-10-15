const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryTransaction = sequelize.define('InventoryTransaction', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  inventoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'inventories',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('stock_in', 'stock_out', 'adjustment', 'expired', 'damaged'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  performedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  referenceNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'inventory_transactions',
  timestamps: true
});

module.exports = InventoryTransaction;