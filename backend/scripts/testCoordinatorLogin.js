const axios = require('axios');

async function testCoordinatorLogin() {
  try {
    console.log('🔐 Testing coordinator login...\n');

    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'coordinator@elderlink.com',
      password: 'Coord@123'
    });

    console.log('✅ Login successful!');
    console.log('\nUser details:');
    console.log('  ID:', response.data.user.id);
    console.log('  Name:', response.data.user.firstName, response.data.user.lastName);
    console.log('  Email:', response.data.user.email);
    console.log('  Role:', response.data.user.role);
    console.log('  Phone:', response.data.user.phone);
    console.log('\nToken:', response.data.token.substring(0, 50) + '...');

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Message:', error.response.data.message);
    } else {
      console.error('  Error:', error.message);
    }
    process.exit(1);
  }
}

testCoordinatorLogin();
