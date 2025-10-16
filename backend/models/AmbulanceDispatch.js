const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AmbulanceDispatch = sequelize.define('AmbulanceDispatch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  emergencyAlertId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'EmergencyAlerts',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  ambulanceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Ambulances',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  },
  coordinatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Coordinator who dispatched the ambulance',
  },
  status: {
    type: DataTypes.ENUM(
      'dispatched',
      'accepted',
      'en_route',
      'arrived',
      'completed',
      'cancelled'
    ),
    allowNull: false,
    defaultValue: 'dispatched',
  },
  dispatchedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  arrivedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estimatedArrivalTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  distance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Distance in kilometers',
  },
  route: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Route information: { origin, destination, waypoints }',
  },
  hospitalDestination: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total response time in seconds',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'AmbulanceDispatches',
  timestamps: true,
  indexes: [
    {
      fields: ['status'],
    },
    {
      fields: ['emergencyAlertId'],
    },
    {
      fields: ['ambulanceId'],
    },
    {
      fields: ['driverId'],
    },
    {
      fields: ['dispatchedAt'],
    },
  ],
});

module.exports = AmbulanceDispatch;
