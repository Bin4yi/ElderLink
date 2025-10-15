// Test script to verify driver API endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// First, login to get a token
async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'coordinator@elderlink.com', // Use coordinator account
      password: 'coordinator123'
    });
    console.log('✅ Login successful');
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Test getting all drivers
async function getAllDrivers(token) {
  try {
    console.log('\n📋 Testing GET /api/drivers...');
    const response = await axios.get(`${API_BASE}/drivers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Success! Found', response.data.count, 'drivers');
    console.log('Drivers:', JSON.stringify(response.data.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get drivers:', error.response?.data || error.message);
    throw error;
  }
}

// Test getting driver stats
async function getDriverStats(token) {
  try {
    console.log('\n📊 Testing GET /api/drivers/stats...');
    const response = await axios.get(`${API_BASE}/drivers/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Success! Stats:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get stats:', error.response?.data || error.message);
    throw error;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Driver API Tests...\n');
  
  try {
    // 1. Login
    const token = await login();
    
    // 2. Get all drivers
    const drivers = await getAllDrivers(token);
    
    // 3. Get driver stats
    const stats = await getDriverStats(token);
    
    console.log('\n✅ All tests passed!');
    console.log('\nSummary:');
    console.log('- Total drivers:', drivers.count);
    console.log('- Stats:', stats.data);
    
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

runTests();
