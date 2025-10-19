// backend/migrations/add-consultation-fee-to-appointments.js
const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('Appointments', 'consultationFee', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Doctor consultation fee at the time of appointment booking'
    });
    
    console.log('✅ Added consultationFee column to Appointments table');
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Appointments', 'consultationFee');
    console.log('✅ Removed consultationFee column from Appointments table');
  }
};
