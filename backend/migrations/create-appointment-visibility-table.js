// backend/migrations/create-appointment-visibility-table.js
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const migration = async () => {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('🔄 Creating AppointmentVisibility table...');

    await queryInterface.createTable('AppointmentVisibility', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      appointment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'Appointments',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to Appointments table'
      },
      allow_medical_record_access: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether doctor can access elder\'s medical history and vitals (1=allowed, 0=denied)'
      },
      granted_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Family member who granted/denied access'
      },
      granted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Optional notes about access decision'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Create indexes
    await queryInterface.addIndex('AppointmentVisibility', ['appointment_id'], {
      unique: true,
      name: 'appointment_visibility_appointment_id_unique'
    });

    await queryInterface.addIndex('AppointmentVisibility', ['granted_by'], {
      name: 'appointment_visibility_granted_by_index'
    });

    console.log('✅ AppointmentVisibility table created successfully');
    console.log('✅ Indexes created successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migration()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migration;
