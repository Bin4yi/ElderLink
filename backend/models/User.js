// backend/models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

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
      notEmpty: true,
      len: [2, 50]
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
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
    allowNull: true,
    validate: {
      len: [10, 15]
    }
  },
  role: {
    type: DataTypes.ENUM(
      'admin',
      'family_member',
      'doctor',
      'staff',
      'elder',
      'pharmacist',
      'mental_health_consultant',
      'coordinator',
      'ambulance_driver'
    ),
    allowNull: false,
    defaultValue: 'family_member'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 50
    }
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  mustChangePassword: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastPasswordChange: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tempPasswordExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
        user.lastPasswordChange = new Date();
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Add this alias for backward compatibility
User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.resetToken;
  return values;
};

module.exports = User;