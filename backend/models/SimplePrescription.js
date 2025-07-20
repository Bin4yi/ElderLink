// models/SimplePrescription.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SimplePrescription = sequelize.define('SimplePrescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientname: DataTypes.STRING,
  patientaddress: DataTypes.STRING,
  doctorname: DataTypes.STRING,
  doctorlicense: DataTypes.STRING,
  doctorsignature: DataTypes.BOOLEAN,
  medicines: DataTypes.JSONB,
  status: DataTypes.STRING
});

module.exports = SimplePrescription;
