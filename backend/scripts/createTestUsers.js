// backend/scripts/createTestUsers.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');

const createTestStaff = async () => {
  try {
    // Create test staff users
    const staffUsers = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'nurse.sarah@elderlink.com',
        password: 'password123',
        role: 'staff',
        phone: '555-0101',
        isActive: true
      },
      {
        firstName: 'Michael',
        lastName: 'Davis',
        email: 'caregiver.michael@elderlink.com',
        password: 'password123',
        role: 'staff',
        phone: '555-0102',
        isActive: true
      },
      {
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'staff.emma@elderlink.com',
        password: 'password123',
        role: 'staff',
        phone: '555-0103',
        isActive: true
      }
    ];

    for (const staffData of staffUsers) {
      const existingUser = await User.findOne({ where: { email: staffData.email } });
      if (!existingUser) {
        await User.create(staffData);
        console.log(`✅ Created staff user: ${staffData.firstName} ${staffData.lastName}`);
      } else {
        console.log(`⚠️ Staff user already exists: ${staffData.email}`);
      }
    }

    console.log('✅ Test staff users created successfully');
  } catch (error) {
    console.error('❌ Error creating test staff users:', error);
  }
};

createTestStaff();