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

### Database Commands
```bash
# Initialize database with sample data
node backend/scripts/initializeDatabase.js

# Update user roles
node backend/scripts/updateUserRoles.js

# Verify users in database
node backend/scripts/verifyUsers.js

# Run migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Generate new migration
npx sequelize-cli migration:generate --name migration-name
```

### Database Models Overview
- **User**: System users with different roles
- **Elder**: Elder profiles managed by families
- **Subscription**: Care package subscriptions
- **Notification**: System notifications

## 🔌 API Development

### API Endpoints Structure
```
/api/auth/*          - Authentication endpoints
/api/users/*         - User management
/api/elders/*        - Elder management
/api/subscriptions/* - Subscription management
/api/notifications/* - Notification system
```

### Standard API Response Format
```javascript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors */ ]
}
```

### Adding New API Endpoints
1. Create controller function
2. Add validation middleware (if needed)
3. Create route definition
4. Register route in server.js
5. Test with Postman or API client

## 🎨 Frontend Development

### Component Structure
```javascript
// Standard Component Template
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const YourComponent = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // API call
    } catch (error) {
      toast.error('Error message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* Component JSX */}
    </div>
  );
};

export default YourComponent;
```

### Styling Guidelines
- Use Tailwind CSS classes
- Follow consistent spacing (p-4, p-6, p-8)
- Use semantic colors (primary, secondary, success, error)
- Maintain responsive design (sm:, md:, lg:, xl:)

## 🔐 Authentication & Authorization

### Authentication Flow
1. User logs in with email/password
2. Backend validates credentials
3. JWT token generated and returned
4. Frontend stores token in localStorage
5. Token included in all API requests
6. Backend validates token on protected routes

### Protected Routes
```javascript
// Usage in App.js
<Route 
  path="/protected-route" 
  element={
    <ProtectedRoute allowedRoles={['admin', 'doctor']}>
      <YourComponent />
    </ProtectedRoute>
  } 
/>
```

### Adding Route Protection
1. Import ProtectedRoute component
2. Wrap your component with ProtectedRoute
3. Specify allowed roles in allowedRoles prop

## 🚀 Deployment Guide

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

### Deployment Steps

#### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Install dependencies: `npm install`
4. Run migrations: `npx sequelize-cli db:migrate`
5. Initialize database: `node scripts/initializeDatabase.js`
6. Start server: `npm start`

#### Frontend Deployment
1. Update API URLs in .env
2. Install dependencies: `npm install`
3. Build project: `npm run build`
4. Deploy build folder to static hosting

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Database connection issues
ERROR: Check DATABASE_URL format and credentials

# JWT token issues  
ERROR: Verify JWT_SECRET is set correctly

# Port already in use
ERROR: Kill process or change PORT in .env
```

#### Frontend Issues
```bash
# Module not found errors
SOLUTION: Run npm install

# API connection errors
SOLUTION: Check REACT_APP_API_URL in .env

# Build errors
SOLUTION: Fix linting errors and run npm run build
```

### Debug Commands
```bash
# Check database connection
node -e "require('./backend/config/database').authenticate().then(() => console.log('Connected')).catch(console.error)"

# Verify user roles
node backend/scripts/verifyUsers.js

# Check API endpoints
curl http://localhost:5000/health
```

## 📝 Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature-name

# Make changes and commit
git add .
git commit -m "Add new feature description"

# Push branch
git push origin feature/new-feature-name

# Create pull request
# Merge after review
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Quality
- Follow consistent naming conventions
- Add comments for complex logic
- Use TypeScript for better type safety (optional)
- Implement error handling
- Write unit tests for critical functions

## 📚 Additional Resources

### Learning Resources
- React Documentation: https://reactjs.org/docs
- Express.js Guide: https://expressjs.com/
- Sequelize ORM: https://sequelize.org/
- Tailwind CSS: https://tailwindcss.com/docs

### API Documentation
- Stripe API: https://stripe.com/docs/api
- Socket.io: https://socket.io/docs/

### Development Tools
- Postman: API testing
- VS Code: Code editor
- pgAdmin: PostgreSQL management
- React DevTools: React debugging

## 🆘 Support

### Getting Help
1. Check this documentation first
2. Search existing issues in repository
3. Ask team members
4. Create new issue with:
   - Problem description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)

### Team Contact
- **Lead Developer**: [Your Name] - [your.email@domain.com]
- **Backend Team**: [Backend Team Contact]
- **Frontend Team**: [Frontend Team Contact]

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated**: June 2025
**Version**: 1.0.0
