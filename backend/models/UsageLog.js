const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UsageLog = sequelize.define('UsageLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  medicineId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'medicine_id',
    references: {
      model: 'medicines',
      key: 'id'
    }
  },
  usageDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'usage_date'
  },
  quantityUsed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quantity_used',
    validate: {
      min: 1
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id'
  },
  notes: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  batchNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'batch_number'
  }
}, {
  tableName: 'usage_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = UsageLog;
