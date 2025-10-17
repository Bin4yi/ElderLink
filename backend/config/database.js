const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use the full connection string from Neon
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?sslmode=require`;

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,              // Reduced from 10 to avoid overwhelming the database
    min: 0,
    acquire: 60000,      // Increased to 60 seconds (from 30)
    idle: 10000,
    evict: 5000          // Added: Check for idle connections every 5 seconds
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000  // Added: 60 second connection timeout
  },
  retry: {
    max: 3  // Added: Retry failed connections up to 3 times
  }
});

module.exports = sequelize;
