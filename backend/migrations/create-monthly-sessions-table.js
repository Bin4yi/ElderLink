// backend/migrations/create-monthly-sessions-table.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

async function up() {
  const queryInterface = sequelize.getQueryInterface();

  console.log('Creating monthly_sessions table...');

  await queryInterface.createTable('monthly_sessions', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    elderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Elders',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    familyMemberId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'id'
      },
      onDelete: 'RESTRICT'
    },
    scheduleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'doctor_schedules',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    sessionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    sessionTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 45
    },
    status: {
      type: DataTypes.ENUM(
        'scheduled',
        'in-progress',
        'completed',
        'cancelled',
        'missed',
        'rescheduled'
      ),
      defaultValue: 'scheduled'
    },
    sessionType: {
      type: DataTypes.ENUM('initial', 'regular', 'follow-up'),
      defaultValue: 'regular'
    },
    isAutoScheduled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    familyNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    doctorNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sessionSummary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vitalSigns: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    prescriptions: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    nextSessionDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rescheduledFrom: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'monthly_sessions',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reminderSentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sessionDuration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    zoomMeetingId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zoomJoinUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    zoomPassword: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  console.log('Adding indexes to monthly_sessions table...');

  // Add indexes
  await queryInterface.addIndex('monthly_sessions', ['elderId'], {
    name: 'monthly_sessions_elder_id_index'
  });

  await queryInterface.addIndex('monthly_sessions', ['doctorId'], {
    name: 'monthly_sessions_doctor_id_index'
  });

  await queryInterface.addIndex('monthly_sessions', ['sessionDate'], {
    name: 'monthly_sessions_session_date_index'
  });

  await queryInterface.addIndex('monthly_sessions', ['status'], {
    name: 'monthly_sessions_status_index'
  });

  console.log('Adding unique constraint to monthly_sessions table...');

  // Add unique constraint
  await queryInterface.addConstraint('monthly_sessions', {
    fields: ['elderId', 'sessionDate'],
    type: 'unique',
    name: 'unique_elder_session_date'
  });

  console.log('✅ monthly_sessions table created successfully!');
}

async function down() {
  const queryInterface = sequelize.getQueryInterface();
  
  console.log('Dropping monthly_sessions table...');
  await queryInterface.dropTable('monthly_sessions');
  console.log('✅ monthly_sessions table dropped successfully!');
}

// Run migration if called directly
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
      
      await up();
      
      console.log('Migration completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = { up, down };
