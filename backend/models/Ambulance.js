const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ambulance = sequelize.define('Ambulance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  vehicleNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  licensePlate: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM(
      'basic_life_support',
      'advanced_life_support',
      'critical_care',
      'air_ambulance'
    ),
    allowNull: false,
    defaultValue: 'basic_life_support',
  },
  status: {
    type: DataTypes.ENUM('available', 'en_route', 'busy', 'maintenance', 'offline'),
    allowNull: false,
    defaultValue: 'available',
  },
  currentLocation: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Current GPS location: { latitude, longitude, accuracy, timestamp }',
  },
  equipment: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Available equipment: oxygen, defibrillator, medications, etc.',
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2,
    comment: 'Number of patients that can be transported',
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  hospital: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Associated hospital or base station',
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'Ambulances',
  timestamps: true,
  indexes: [
    {
      fields: ['status'],
    },
    {
      fields: ['driverId'],
    },
    {
      fields: ['isActive'],
    },
  ],
});

module.exports = Ambulance;
