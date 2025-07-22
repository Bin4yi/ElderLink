// backend/scripts/testAdminEndpoints.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const testAdminEndpoints = async () => {
  try {
    console.log('🧪 Testing admin endpoints...');
    
    // Find admin user
    const admin = await User.findOne({ where: { email: 'admin@elderlink.com' } });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin user found:', admin.email, 'Role:', admin.role);
    
    // Generate token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET
    );
    
    console.log('🔑 Generated token:', token.substring(0, 50) + '...');
    
    // Test stats endpoint
    console.log('\n📊 Testing stats endpoint...');
    const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Stats response status:', statsResponse.status);
    const statsData = await statsResponse.json();
    console.log('Stats response:', statsData);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

testAdminEndpoints();