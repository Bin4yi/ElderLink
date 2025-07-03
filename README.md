# ElderLink - Complete Elder Care Management System

A comprehensive healthcare management platform connecting families with their elderly loved ones through multiple user roles including family members, doctors, staff, pharmacists, and administrators.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [System Overview](#system-overview)
- [File System Structure](#file-system-structure)
- [User Roles & Permissions](#user-roles--permissions)
- [Adding New Features](#adding-new-features)
- [Adding New User Roles (Actors)](#adding-new-user-roles-actors)
- [Database Management](#database-management)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Authentication & Authorization](#authentication--authorization)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Stripe account (for payments)
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and API keys
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URLs
npm start
```

### Default Login Credentials
- **Admin**: admin@elderlink.com / Admin@123456
- **Doctor**: doctor@elderlink.com / Doctor@123456
- **Staff**: staff@elderlink.com / Staff@123456
- **Pharmacist**: pharmacist@elderlink.com / Pharmacy@123456

## 🏗️ System Overview

### Tech Stack
- **Backend**: Node.js, Express.js, PostgreSQL, Sequelize ORM
- **Frontend**: React.js, Tailwind CSS, Lucide Icons
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Stripe Integration
- **Real-time**: Socket.io
- **Database**: PostgreSQL (Neon Cloud)

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 5000    │    │   (Neon Cloud)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 File System Structure

```
elderlink-system/
├── backend/                    # Node.js backend server
│   ├── config/
│   │   ├── database.js        # Database connection
│   │   ├── jwt.js             # JWT configuration
│   │   └── stripe.js          # Stripe payment config
│   ├── controllers/           # Business logic handlers
│   │   ├── authController.js  # Authentication logic
│   │   ├── elderController.js # Elder management
│   │   ├── subscriptionController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── validation.js      # Input validation
│   ├── models/                # Database models
│   │   ├── User.js            # User model
│   │   ├── Elder.js           # Elder model
│   │   ├── Subscription.js    # Subscription model
│   │   ├── Notification.js    # Notification model
│   │   └── index.js           # Model associations
│   ├── routes/                # API route definitions
│   │   ├── auth.js
│   │   ├── elder.js
│   │   ├── subscription.js
│   │   └── notification.js
│   ├── scripts/               # Database scripts
│   │   ├── initializeDatabase.js
│   │   ├── updateUserRoles.js
│   │   └── verifyUsers.js
│   ├── uploads/               # File uploads storage
│   ├── utils/                 # Utility functions
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Main server file
│
├── frontend/                   # React frontend application
│   ├── public/
│   │   ├── index.html         # Main HTML template
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── admin/         # Admin-specific components
│   │   │   │   ├── dashboard/
│   │   │   │   ├── users/
│   │   │   │   ├── packages/
│   │   │   │   └── analytics/
│   │   │   ├── family/        # Family member components
│   │   │   │   ├── dashboard/
│   │   │   │   ├── elder/
│   │   │   │   ├── subscription/
│   │   │   │   └── profile/
│   │   │   ├── doctor/        # Doctor components
│   │   │   │   ├── dashboard/
│   │   │   │   ├── patients/
│   │   │   │   ├── appointments/
│   │   │   │   └── consultations/
│   │   │   ├── staff/         # Care staff components
│   │   │   │   ├── dashboard/
│   │   │   │   ├── care/
│   │   │   │   └── monitoring/
│   │   │   ├── pharmacist/    # Pharmacist components
│   │   │   │   ├── dashboard/
│   │   │   │   ├── medications/
│   │   │   │   └── delivery/
│   │   │   ├── common/        # Shared components
│   │   │   │   ├── Navbar.js
│   │   │   │   ├── Sidebar.js
│   │   │   │   ├── Loading.js
│   │   │   │   └── RoleLayout.js
│   │   │   └── auth/          # Authentication components
│   │   │       ├── Login.js
│   │   │       ├── Register.js
│   │   │       └── ProtectedRoute.js
│   │   ├── context/           # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   └── NotificationContext.js
│   │   ├── services/          # API service functions
│   │   │   ├── api.js         # Axios configuration
│   │   │   ├── auth.js        # Authentication services
│   │   │   ├── elder.js       # Elder services
│   │   │   └── subscription.js
│   │   ├── utils/             # Utility functions
│   │   │   ├── constants.js   # App constants
│   │   │   ├── helpers.js     # Helper functions
│   │   │   └── roleMenus.js   # Role-based menu items
│   │   ├── pages/             # Main page components
│   │   │   ├── Landing.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── Profile.js
│   │   ├── config/
│   │   │   └── stripe.js      # Stripe configuration
│   │   ├── App.js             # Main app component
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Global styles
│   ├── .env                   # Frontend environment variables
│   ├── package.json
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── postcss.config.js
│
├── .gitignore                 # Git ignore rules
├── docker-compose.yml         # Docker configuration
└── README.md                  # This documentation
```

## 👥 User Roles & Permissions

### Current User Roles

1. **Family Member** (`family_member`)
   - Subscribe to care packages
   - Add and manage elders
   - View health reports
   - Make payments
   - Receive notifications

2. **Admin** (`admin`)
   - Manage all users
   - Configure packages
   - View system analytics
   - Handle approvals
   - System settings

3. **Doctor** (`doctor`)
   - View assigned patients
   - Conduct consultations
   - Manage appointments
   - Update medical records
   - Emergency alerts

4. **Care Staff** (`staff`)
   - Monitor assigned elders
   - Complete care tasks
   - Report health status
   - Handle alerts
   - Daily care management

5. **Pharmacist** (`pharmacist`)
   - Manage prescriptions
   - Handle medication orders
   - Schedule deliveries
   - Track inventory
   - Patient medication history

## ➕ Adding New Features

### Step 1: Backend Development

#### 1.1 Create Database Model (if needed)
```javascript
// backend/models/NewFeature.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NewFeature = sequelize.define('NewFeature', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Add other fields
}, {
  tableName: 'new_features',
  timestamps: true
});

module.exports = NewFeature;
```

#### 1.2 Create Controller
```javascript
// backend/controllers/newFeatureController.js
const { NewFeature } = require('../models');

const createNewFeature = async (req, res) => {
  try {
    const newFeature = await NewFeature.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Feature created successfully',
      data: newFeature
    });
  } catch (error) {
    console.error('Create feature error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

const getNewFeatures = async (req, res) => {
  try {
    const features = await NewFeature.findAll();
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  createNewFeature,
  getNewFeatures
};
```

#### 1.3 Create Routes
```javascript
// backend/routes/newFeature.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  createNewFeature, 
  getNewFeatures 
} = require('../controllers/newFeatureController');

// POST /api/new-features
router.post('/', auth, createNewFeature);

// GET /api/new-features
router.get('/', auth, getNewFeatures);

module.exports = router;
```

#### 1.4 Register Routes in Server
```javascript
// backend/server.js
const newFeatureRoutes = require('./routes/newFeature');
app.use('/api/new-features', newFeatureRoutes);
```

### Step 2: Frontend Development

#### 2.1 Create Service
```javascript
// frontend/src/services/newFeature.js
import api from './api';

export const newFeatureService = {
  createFeature: async (featureData) => {
    try {
      const response = await api.post('/new-features', featureData);
      return response.data;
    } catch (error) {
      console.error('Create feature error:', error);
      throw error;
    }
  },

  getFeatures: async () => {
    try {
      const response = await api.get('/new-features');
      return response.data;
    } catch (error) {
      console.error('Get features error:', error);
      throw error;
    }
  }
};
```

#### 2.2 Create Component
```javascript
// frontend/src/components/common/NewFeature.js
import React, { useState, useEffect } from 'react';
import { newFeatureService } from '../../services/newFeature';
import toast from 'react-hot-toast';

const NewFeature = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const response = await newFeatureService.getFeatures();
      setFeatures(response.data);
    } catch (error) {
      toast.error('Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">New Feature</h2>
      {/* Add your component JSX here */}
    </div>
  );
};

export default NewFeature;
```

#### 2.3 Add Route (if needed)
```javascript
// frontend/src/App.js
import NewFeature from './components/common/NewFeature';

// Add to Routes component
<Route 
  path="/new-feature" 
  element={
    <ProtectedRoute allowedRoles={['admin', 'staff']}>
      <NewFeature />
    </ProtectedRoute>
  } 
/>
```

## 👤 Adding New User Roles (Actors)

### Step 1: Update User Model
```javascript
// backend/models/User.js
// Add new role to ENUM
role: {
  type: DataTypes.ENUM(
    'admin', 
    'family_member', 
    'doctor', 
    'staff', 
    'pharmacist',
    'new_role'  // Add your new role here
  ),
  allowNull: false,
  defaultValue: 'family_member'
}
```

### Step 2: Create Database Migration
```bash
# Generate migration
npx sequelize-cli migration:generate --name add-new-role-to-users

# Edit migration file
# backend/migrations/XXXXXX-add-new-role-to-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM(
        'admin', 
        'family_member', 
        'doctor', 
        'staff', 
        'pharmacist',
        'new_role'
      ),
      allowNull: false,
      defaultValue: 'family_member'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the new role
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM(
        'admin', 
        'family_member', 
        'doctor', 
        'staff', 
        'pharmacist'
      ),
      allowNull: false,
      defaultValue: 'family_member'
    });
  }
};

# Run migration
npx sequelize-cli db:migrate
```

### Step 3: Create Role Components
```javascript
// frontend/src/components/newRole/dashboard/NewRoleDashboard.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { useAuth } from '../../../context/AuthContext';

const NewRoleDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});

  return (
    <RoleLayout title="New Role Dashboard">
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-white/80">
            Your new role dashboard
          </p>
        </div>
        
        {/* Add role-specific content */}
      </div>
    </RoleLayout>
  );
};

export default NewRoleDashboard;
```

### Step 4: Update Role Menu
```javascript
// frontend/src/utils/roleMenus.js
case 'new_role':
  return [
    { path: '/new-role/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/new-role/feature1', icon: Users, label: 'Feature 1' },
    { path: '/new-role/feature2', icon: Settings, label: 'Feature 2' },
    // Add more menu items
  ];
```

### Step 5: Add Routes
```javascript
// frontend/src/App.js
import NewRoleDashboard from './components/newRole/dashboard/NewRoleDashboard';

// Add to Routes
<Route 
  path="/new-role/dashboard" 
  element={
    <ProtectedRoute allowedRoles={['new_role']}>
      <NewRoleDashboard />
    </ProtectedRoute>
  } 
/>
```

### Step 6: Update Role Redirect
```javascript
// frontend/src/App.js - RoleRedirect component
const RoleRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  switch (user.role) {
    case 'family_member':
      return <Navigate to="/family/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'doctor':
      return <Navigate to="/doctor/dashboard" replace />;
    case 'staff':
      return <Navigate to="/staff/dashboard" replace />;
    case 'pharmacist':
      return <Navigate to="/pharmacy/dashboard" replace />;
    case 'new_role':
      return <Navigate to="/new-role/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};
```

## 🗄️ Database Management

## 🗄️ Database Creation & Management - Complete Guide for Beginners

### What is a Database? 🤔

Think of a database like a **digital filing cabinet** where we store all information about:
- 👥 **Users** (like family members, doctors, staff)
- 👴 **Elders** (the people being cared for)
- 💳 **Subscriptions** (care packages families buy)
- 🔔 **Notifications** (messages and alerts)

### Step-by-Step Database Setup 🎯

#### Step 1: Install PostgreSQL Database

**What you need:**
```bash
# Option 1: Use Neon Cloud (Easiest - Recommended for beginners)
# Go to: https://neon.tech
# Sign up for free account
# Create new database
# Copy connection string

# Option 2: Local PostgreSQL (Advanced users)
# Download from: https://www.postgresql.org/download/
# Install and setup local database
```

#### Step 2: Database Configuration

**Create your database connection file:**
```javascript
// filepath: backend/config/database.js
const { Sequelize } = require('sequelize');

// Database connection - like giving directions to your filing cabinet
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log, // Shows what database is doing (helpful for learning)
});

// Test if we can connect to database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

module.exports = sequelize;
```

#### Step 3: Understanding Database Models (Tables)

**Models are like different folders in your filing cabinet:**

##### 🗂️ User Model - The People Folder
```javascript
// filepath: backend/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

// This is like creating a form template for storing people information
const User = sequelize.define('User', {
  // ID - Like a unique student number for each person
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Personal Information - Like a name tag
  firstName: {
    type: DataTypes.STRING,
    allowNull: false, // This means "REQUIRED - can't be empty"
    validate: {
      len: [2, 50], // Must be between 2-50 characters
      notEmpty: true
    }
  },
  
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  
  // Email - Like their address for digital mail
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Only one person can have this email
    validate: {
      isEmail: true // Must look like: someone@example.com
    }
  },
  
  // Password - Their secret key (encrypted for security)
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100] // Must be at least 6 characters
    }
  },
  
  // Phone - Their phone number
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^[\+]?[\d\s\-\(\)]+$/ // Only numbers, spaces, +, -, (, )
    }
  },
  
  // Role - What job they do in our system
  role: {
    type: DataTypes.ENUM(
      'admin',           // 👑 Boss who manages everything
      'family_member',   // 👨‍👩‍👧‍👦 Family who cares for elders
      'doctor',          // 👨‍⚕️ Medical doctor
      'staff',           // 👥 Care workers
      'pharmacist',      // 💊 Medicine specialists
      'elder'            // 👴 The elderly people being cared for
    ),
    allowNull: false,
    defaultValue: 'family_member'
  },
  
  // Active status - Are they allowed to use the system?
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Profile picture path
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Last time they logged in
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Email verification
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Users', // Name of the table in database
  timestamps: true,   // Automatically adds createdAt and updatedAt
  
  // Hooks - Things that happen automatically
  hooks: {
    // Before saving user, encrypt their password
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Method to check if password is correct
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to get user info without password
User.prototype.toSafeObject = function() {
  const { password, emailVerificationToken, ...safeUser } = this.toJSON();
  return safeUser;
};

module.exports = User;
```

##### 👴 Elder Model - The Elder Information Folder
```javascript
// filepath: backend/models/Elder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Template for storing elder (elderly person) information
const Elder = sequelize.define('Elder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Which subscription plan they belong to
  subscriptionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Subscriptions', // Points to Subscriptions table
      key: 'id'
    }
  },
  
  // If elder has login access, which user account?
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // Can be empty if no login access
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  
  // Personal Information
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
  
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString() // Must be in the past
    }
  },
  
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  
  // Contact Information
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 500] // At least 10 characters for complete address
    }
  },
  
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [10, 15]
    }
  },
  
  emergencyContact: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [10, 15]
    }
  },
  
  // Profile photo filename
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Medical Information (all optional)
  bloodType: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']]
    }
  },
  
  medicalHistory: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  currentMedications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  chronicConditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Healthcare Provider Information
  doctorName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  doctorPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Insurance Information
  insuranceProvider: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  insuranceNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Login Access Management
  hasLoginAccess: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true // Each username must be different
  }
}, {
  tableName: 'Elders',
  timestamps: true,
  
  // Virtual fields - calculated fields that don't exist in database
  getterMethods: {
    fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
    
    age() {
      if (!this.dateOfBirth) return null;
      const today = new Date();
      const birthDate = new Date(this.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    }
  }
});

module.exports = Elder;
```

##### 💳 Subscription Model - The Payment Plans Folder
```javascript
// filepath: backend/models/Subscription.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Template for storing subscription (payment plan) information
const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Which user (family member) bought this plan
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  
  // Type of care plan
  plan: {
    type: DataTypes.ENUM('basic', 'standard', 'premium'),
    allowNull: false,
    defaultValue: 'basic'
  },
  
  // Payment period length
  duration: {
    type: DataTypes.ENUM('1_month', '3_months', '6_months', '12_months'),
    allowNull: false,
    defaultValue: '1_month'
  },
  
  // How much they paid
  amount: {
    type: DataTypes.DECIMAL(10, 2), // Up to 99,999,999.99
    allowNull: false,
    validate: {
      min: 0 // Can't be negative
    }
  },
  
  // Payment status
  status: {
    type: DataTypes.ENUM('pending', 'active', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'pending'
  },
  
  // When subscription starts and ends
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  // Stripe payment information
  stripeCustomerId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  stripeSubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Auto-renewal settings
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Cancellation information
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Payment history (JSON format)
  paymentHistory: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'Subscriptions',
  timestamps: true,
  
  // Virtual fields
  getterMethods: {
    isActive() {
      return this.status === 'active' && new Date() <= new Date(this.endDate);
    },
    
    daysRemaining() {
      if (this.status !== 'active') return 0;
      const now = new Date();
      const end = new Date(this.endDate);
      const diffTime = end - now;
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
  },
  
  // Hooks
  hooks: {
    beforeCreate: (subscription) => {
      // Calculate end date based on duration
      const start = new Date(subscription.startDate);
      const end = new Date(start);
      
      switch (subscription.duration) {
        case '1_month':
          end.setMonth(end.getMonth() + 1);
          break;
        case '3_months':
          end.setMonth(end.getMonth() + 3);
          break;
        case '6_months':
          end.setMonth(end.getMonth() + 6);
          break;
        case '12_months':
          end.setFullYear(end.getFullYear() + 1);
          break;
      }
      
      subscription.endDate = end;
    }
  }
});

module.exports = Subscription;
```

##### 🔔 Notification Model - The Messages Folder
```javascript
// filepath: backend/models/Notification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Template for storing notification (message) information
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Who should receive this notification
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  
  // What type of notification is this?
  type: {
    type: DataTypes.ENUM(
      'subscription_created',    // New subscription purchased
      'subscription_expiring',   // Subscription about to expire
      'elder_added',            // New elder added to care
      'health_alert',           // Health emergency or concern
      'appointment_reminder',   // Upcoming appointment
      'medication_reminder',    // Time to take medicine
      'payment_success',        // Payment processed successfully
      'payment_failed',         // Payment failed
      'system_update',          // System news or updates
      'emergency_alert'         // Emergency situation
    ),
    allowNull: false
  },
  
  // Notification title and message
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  // Priority level
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal'
  },
  
  // Has user read this notification?
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // When was it read?
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Additional data (JSON format)
  data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  
  // Link to take action
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Button text for action
  actionText: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Expiration date (for temporary notifications)
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Notifications',
  timestamps: true,
  
  // Indexes for better performance
  indexes: [
    {
      fields: ['userId', 'isRead'] // Faster queries for user's unread notifications
    },
    {
      fields: ['type'] // Faster queries by notification type
    },
    {
      fields: ['priority'] // Faster queries by priority
    }
  ]
});

module.exports = Notification;
```

#### Step 4: Database Relationships (How Tables Connect)

**Think of relationships like family connections:**

```javascript
// filepath: backend/models/index.js
const User = require('./User');
const Elder = require('./Elder');
const Subscription = require('./Subscription');
const Notification = require('./Notification');

// 🔗 USER ↔ SUBSCRIPTION Relationship
// One user can have many subscriptions (like buying multiple care plans)
User.hasMany(Subscription, { 
  foreignKey: 'userId', 
  as: 'subscriptions',
  onDelete: 'CASCADE' // If user deleted, delete their subscriptions too
});

Subscription.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// 🔗 USER ↔ NOTIFICATION Relationship  
// One user can have many notifications
User.hasMany(Notification, { 
  foreignKey: 'userId', 
  as: 'notifications',
  onDelete: 'CASCADE'
});

Notification.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// 🔗 SUBSCRIPTION ↔ ELDER Relationship
// One subscription can have one elder assigned to it
Subscription.hasOne(Elder, { 
  foreignKey: 'subscriptionId', 
  as: 'elder',
  onDelete: 'CASCADE'
});

Elder.belongsTo(Subscription, { 
  foreignKey: 'subscriptionId', 
  as: 'subscription' 
});

// 🔗 USER ↔ ELDER Relationship (for elder login access)
// One user can be linked to one elder profile (when elder has login)
User.hasOne(Elder, {
  foreignKey: 'userId',
  as: 'elderProfile',
  onDelete: 'SET NULL' // If user deleted, just remove link, keep elder
});

Elder.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Export all models for use in other files
module.exports = {
  User,
  Elder,
  Subscription,
  Notification
};
```
