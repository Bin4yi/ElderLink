// backend/migrations/allow-null-appointmentDate.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use the full connection string from Neon
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?sslmode=require`;

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function updateAppointmentDateColumn() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Modify the appointmentDate column to allow NULL values
    await sequelize.query(`
      ALTER TABLE "Appointments" 
      ALTER COLUMN "appointmentDate" DROP NOT NULL;
    `);

    console.log('✅ Successfully updated appointmentDate column to allow NULL values');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

updateAppointmentDateColumn();
