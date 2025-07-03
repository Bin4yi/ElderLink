// backend/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Updated role with mental health consultant
  role: {
    type: DataTypes.ENUM(
      'admin',                      // 👑 Boss
      'family_member',              // 👨‍👩‍👧‍👦 Family
      'doctor',                     // 👨‍⚕️ Doctor
      'staff',                      // 👥 Care worker
      'elder',                      // 👴 Elderly person
      'pharmacist',                 // 💊 Pharmacist
      'mental_health_consultant'    // 🧠 Mental Health Consultant - NEW!
    ),
    allowNull: false,
    defaultValue: 'family_member'
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Additional fields for mental health consultants
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true, // Only required for professionals
    validate: {
      isLicenseValid(value) {
        if (this.role === 'mental_health_consultant' && !value) {
          throw new Error('License number is required for mental health consultants');
        }
      }
    }
  },
  
  specialization: {
    type: DataTypes.STRING,
    allowNull: true // e.g., "Geriatric Psychology", "Dementia Care", "Anxiety Disorders"
  }
}, {
  tableName: 'Users',
  timestamps: true,
  
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;