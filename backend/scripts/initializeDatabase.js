// backend/scripts/initializeDatabase.js (FIXED VERSION)
const sequelize = require('../config/database');
const { User, Notification } = require('../models');

// User accounts for different roles (PASSWORDS IN PLAIN TEXT - let model hash them)
const defaultUsers = [
  // Admin Accounts
  {
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@elderlink.com',
    password: 'Admin@123456', // Plain text - model will hash it
    phone: '+1-800-ADMIN01',
    role: 'admin',
    isActive: true
  },
  {
    firstName: 'Sarah',
    lastName: 'Manager',
    email: 'sarah.manager@elderlink.com',
    password: 'Manager@123', // Plain text - model will hash it
    phone: '+1-800-ADMIN02',
    role: 'admin',
    isActive: true
  },
  
  // Doctor Accounts
  {
    firstName: 'Dr. Michael',
    lastName: 'Johnson',
    email: 'dr.johnson@elderlink.com',
    password: 'Doctor@123', // Plain text - model will hash it
    phone: '+1-555-DOC-001',
    role: 'doctor',
    isActive: true
  },
  {
    firstName: 'Dr. Emily',
    lastName: 'Chen',
    email: 'dr.chen@elderlink.com',
    password: 'Doctor@456', // Plain text - model will hash it
    phone: '+1-555-DOC-002',
    role: 'doctor',
    isActive: true
  },
  {
    firstName: 'Dr. Robert',
    lastName: 'Williams',
    email: 'dr.williams@elderlink.com',
    password: 'Doctor@789', // Plain text - model will hash it
    phone: '+1-555-DOC-003',
    role: 'doctor',
    isActive: true
  },
  
  // Staff Accounts
  {
    firstName: 'Jessica',
    lastName: 'Thompson',
    email: 'jessica.thompson@elderlink.com',
    password: 'Staff@123', // Plain text - model will hash it
    phone: '+1-555-STAFF01',
    role: 'staff',
    isActive: true
  },
  {
    firstName: 'David',
    lastName: 'Rodriguez',
    email: 'david.rodriguez@elderlink.com',
    password: 'Staff@456', // Plain text - model will hash it
    phone: '+1-555-STAFF02',
    role: 'staff',
    isActive: true
  },
  {
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@elderlink.com',
    password: 'Staff@789', // Plain text - model will hash it
    phone: '+1-555-STAFF03',
    role: 'staff',
    isActive: true
  },
  
  // Pharmacist Accounts
  {
    firstName: 'Dr. Kevin',
    lastName: 'Lee',
    email: 'pharmacist.lee@elderlink.com',
    password: 'Pharm@123', // Plain text - model will hash it
    phone: '+1-555-PHARM01',
    role: 'pharmacist',
    isActive: true
  },
  {
    firstName: 'Dr. Maria',
    lastName: 'Santos',
    email: 'pharmacist.santos@elderlink.com',
    password: 'Pharm@456', // Plain text - model will hash it
    phone: '+1-555-PHARM02',
    role: 'pharmacist',
    isActive: true
  },
  
  // Sample Family Member Accounts
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    password: 'Family@123', // Plain text - model will hash it
    phone: '+1-555-FAM-001',
    role: 'family_member',
    isActive: true
  },
  {
    firstName: 'Mary',
    lastName: 'Johnson',
    email: 'mary.johnson@example.com',
    password: 'Family@456', // Plain text - model will hash it
    phone: '+1-555-FAM-002',
    role: 'family_member',
    isActive: true
  },
  
  // Mental Health Consultant Accounts - NEW!
  {
    firstName: 'Dr. Sarah',
    lastName: 'Mitchell',
    email: 'dr.mitchell@elderlink.com',
    password: 'Mental@123',
    phone: '+1-555-MH-001',
    role: 'mental_health_consultant',
    licenseNumber: 'MH-2024-001',
    specialization: 'Geriatric Psychology',
    isActive: true
  },
  {
    firstName: 'Dr. James',
    lastName: 'Thompson',
    email: 'dr.thompson@elderlink.com',
    password: 'Mental@456',
    phone: '+1-555-MH-002',
    role: 'mental_health_consultant',
    licenseNumber: 'MH-2024-002',
    specialization: 'Dementia Care and Support',
    isActive: true
  },
  {
    firstName: 'Dr. Maria',
    lastName: 'Rodriguez',
    email: 'dr.maria.rodriguez@elderlink.com',
    password: 'Mental@789',
    phone: '+1-555-MH-003',
    role: 'mental_health_consultant',
    licenseNumber: 'MH-2024-003',
    specialization: 'Anxiety and Depression in Seniors',
    isActive: true
  },
  {
    firstName: 'Dr. Robert',
    lastName: 'Chen',
    email: 'dr.robert.chen@elderlink.com',
    password: 'Mental@012',
    phone: '+1-555-MH-004',
    role: 'mental_health_consultant',
    licenseNumber: 'MH-2024-004',
    specialization: 'Cognitive Behavioral Therapy for Elderly',
    isActive: true
  }
];

// Welcome notifications for different roles
const getWelcomeNotifications = (userId, role, firstName) => {
  const notifications = {
    admin: {
      title: 'Welcome to ElderLink Admin Panel',
      message: `Welcome ${firstName}! You now have full administrative access to the ElderLink platform.`,
      type: 'info'
    },
    doctor: {
      title: 'Welcome Dr. ' + firstName,
      message: `Welcome to the ElderLink healthcare platform! You can now access patient records and provide care.`,
      type: 'info'
    },
    staff: {
      title: 'Welcome to ElderLink Team',
      message: `Hi ${firstName}! Welcome to the ElderLink care team.`,
      type: 'info'
    },
    pharmacist: {
      title: 'ElderLink Pharmacy Portal Access',
      message: `Welcome ${firstName}! Your pharmacy account is now active.`,
      type: 'info'
    },
    family_member: {
      title: 'Welcome to ElderLink',
      message: `Hi ${firstName}! Welcome to ElderLink. You can now subscribe to care packages.`,
      type: 'success'
    },
    mental_health_consultant: {
      title: 'Welcome Dr. ' + firstName,
      message: `Welcome to the ElderLink mental health consultant team! You can now provide mental health support and consultations.`,
      type: 'info'
    }
  };

  return {
    userId,
    ...notifications[role],
    isRead: false
  };
};

const initializeUsers = async () => {
  try {
    console.log('👥 Initializing user accounts...');
    
    const createdUsers = [];
    
    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ 
        where: { email: userData.email } 
      });
      
      if (!existingUser) {
        // DO NOT hash password here - let the model's beforeCreate hook handle it
        const user = await User.create(userData);
        
        createdUsers.push(user);
        console.log(`✅ Created ${userData.role}: ${userData.firstName} ${userData.lastName} (${userData.email})`);
        
        // Test password immediately after creation
        const passwordTest = await user.comparePassword(userData.password);
        console.log(`🔐 Password test for ${userData.email}: ${passwordTest ? '✅' : '❌'}`);
        
        // Create welcome notification
        const notificationData = getWelcomeNotifications(user.id, user.role, user.firstName);
        await Notification.create(notificationData);
        
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }
    
    console.log('✅ User initialization completed!');
    return createdUsers;
  } catch (error) {
    console.error('❌ Error initializing users:', error);
    throw error;
  }
};

const createSystemNotifications = async () => {
  try {
    console.log('🔔 Creating system notifications...');
    
    // Get all admin users for system notifications
    const adminUsers = await User.findAll({ where: { role: 'admin' } });
    
    const systemNotifications = [
      {
        title: 'System Initialization Complete',
        message: 'ElderLink system has been successfully initialized with default packages and user accounts.',
        type: 'success'
      },
      {
        title: 'Security Reminder',
        message: 'Please change default passwords for all system accounts before going to production.',
        type: 'warning'
      },
      {
        title: 'Database Seeded',
        message: 'Database has been populated with sample data. Review and customize as needed.',
        type: 'info'
      }
    ];
    
    for (const admin of adminUsers) {
      for (const notificationTemplate of systemNotifications) {
        await Notification.create({
          userId: admin.id,
          ...notificationTemplate,
          isRead: false
        });
      }
    }
    
    console.log('✅ System notifications created!');
  } catch (error) {
    console.error('❌ Error creating system notifications:', error);
    throw error;
  }
};

const displayCredentials = () => {
  console.log('\n🔐 DEFAULT LOGIN CREDENTIALS');
  console.log('='.repeat(50));
  
  console.log('\n👨‍💼 ADMIN ACCOUNTS:');
  console.log('Email: admin@elderlink.com');
  console.log('Password: Admin@123456');
  
  console.log('\n👨‍⚕️ DOCTOR ACCOUNTS:');
  console.log('Email: dr.johnson@elderlink.com');
  console.log('Password: Doctor@123');
  console.log('---');
  console.log('Email: dr.chen@elderlink.com');
  console.log('Password: Doctor@456');
  
  console.log('\n👥 STAFF ACCOUNTS:');
  console.log('Email: jessica.thompson@elderlink.com');
  console.log('Password: Staff@123');
  console.log('---');
  console.log('Email: david.rodriguez@elderlink.com');
  console.log('Password: Staff@456');
  
  console.log('\n💊 PHARMACIST ACCOUNTS:');
  console.log('Email: pharmacist.lee@elderlink.com');
  console.log('Password: Pharm@123');
  
  // NEW: Mental Health Consultant accounts
  console.log('\n🧠 MENTAL HEALTH CONSULTANT ACCOUNTS:');
  console.log('Email: dr.mitchell@elderlink.com');
  console.log('Password: Mental@123');
  console.log('Specialization: Geriatric Psychology');
  console.log('---');
  console.log('Email: dr.thompson@elderlink.com');
  console.log('Password: Mental@456');
  console.log('Specialization: Dementia Care and Support');
  console.log('---');
  console.log('Email: dr.maria.rodriguez@elderlink.com');
  console.log('Password: Mental@789');
  console.log('Specialization: Anxiety and Depression in Seniors');
  console.log('---');
  console.log('Email: dr.robert.chen@elderlink.com');
  console.log('Password: Mental@012');
  console.log('Specialization: Cognitive Behavioral Therapy for Elderly');
  
  console.log('\n👨‍👩‍👧‍👦 FAMILY MEMBER ACCOUNTS:');
  console.log('Email: john.smith@example.com');
  console.log('Password: Family@123');
  
  console.log('\n⚠️  SECURITY WARNING:');
  console.log('🔸 Change all default passwords before production!');
  console.log('🔸 These are demo accounts for development only');
  console.log('🔸 Delete test family accounts in production');
  console.log('='.repeat(50));
};

const reinitializeUsers = async () => {
  try {
    console.log('🔄 Re-initializing users with correct passwords...');
    console.log('='.repeat(50));
    
    // Sync database
    await sequelize.sync();
    console.log('✅ Database synchronized');
    
    // Delete existing problematic users and recreate them
    console.log('🗑️ Removing existing users...');
    await User.destroy({ 
      where: { 
        email: defaultUsers.map(u => u.email) 
      } 
    });
    
    // Initialize users with correct password handling
    await initializeUsers();
    
    // Create system notifications
    await createSystemNotifications();
    
    console.log('\n🎉 User re-initialization completed successfully!');
    
    // Display login credentials
    displayCredentials();
    
    return true;
  } catch (error) {
    console.error('❌ User re-initialization failed:', error);
    return false;
  }
};

// Run the re-initialization
if (require.main === module) {
  reinitializeUsers().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { 
  reinitializeUsers,
  initializeUsers,
  defaultUsers
};