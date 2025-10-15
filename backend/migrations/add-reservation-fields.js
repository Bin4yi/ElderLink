// backend/migrations/add-reservation-fields.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

async function addReservationFields() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('🔄 Adding reservation fields to Appointments table...');

    // Check if columns already exist
    const tableDescription = await queryInterface.describeTable('Appointments');

    // Add reservedAt column if it doesn't exist
    if (!tableDescription.reservedAt) {
      await queryInterface.addColumn('Appointments', 'reservedAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
      console.log('✅ Added reservedAt column');
    }

    // Add reservedBy column if it doesn't exist
    if (!tableDescription.reservedBy) {
      await queryInterface.addColumn('Appointments', 'reservedBy', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      });
      console.log('✅ Added reservedBy column');
    }

    // Update status enum to include 'reserved'
    if (tableDescription.status) {
      await sequelize.query(`
        ALTER TABLE "Appointments" 
        DROP CONSTRAINT IF EXISTS "Appointments_status_check";
      `);
      
      await sequelize.query(`
        ALTER TABLE "Appointments" 
        ADD CONSTRAINT "Appointments_status_check" 
        CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled', 'no-show', 'reserved'));
      `);
      console.log('✅ Updated status enum to include reserved');
    }

    // Make reason field nullable
    if (tableDescription.reason && tableDescription.reason.allowNull === false) {
      await queryInterface.changeColumn('Appointments', 'reason', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      console.log('✅ Made reason field nullable');
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addReservationFields()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addReservationFields;
