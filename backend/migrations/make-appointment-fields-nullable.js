// backend/migrations/make-appointment-fields-nullable.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

async function makeAppointmentFieldsNullable() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('🔄 Making elderId and familyMemberId nullable in Appointments table...');

    const tableDescription = await queryInterface.describeTable('Appointments');

    // Make elderId nullable
    if (tableDescription.elderId && tableDescription.elderId.allowNull === false) {
      await queryInterface.changeColumn('Appointments', 'elderId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Elders',
          key: 'id'
        }
      });
      console.log('✅ Made elderId nullable');
    } else {
      console.log('ℹ️  elderId is already nullable');
    }

    // Make familyMemberId nullable
    if (tableDescription.familyMemberId && tableDescription.familyMemberId.allowNull === false) {
      await queryInterface.changeColumn('Appointments', 'familyMemberId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      });
      console.log('✅ Made familyMemberId nullable');
    } else {
      console.log('ℹ️  familyMemberId is already nullable');
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  makeAppointmentFieldsNullable()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = makeAppointmentFieldsNullable;
