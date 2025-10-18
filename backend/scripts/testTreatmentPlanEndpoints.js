// backend/scripts/testTreatmentPlanEndpoints.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api/mental-health/treatment-plans';

// You'll need to replace these with actual tokens from your logged-in users
const STAFF_TOKEN = 'YOUR_STAFF_JWT_TOKEN_HERE';
const SPECIALIST_TOKEN = 'YOUR_SPECIALIST_JWT_TOKEN_HERE';

async function testCaregiverEndpoint() {
  console.log('\n=== Testing Caregiver Treatment Plans Endpoint ===');
  try {
    const response = await axios.get(`${BASE_URL}/caregiver`, {
      headers: {
        'Authorization': `Bearer ${STAFF_TOKEN}`
      }
    });
    console.log('✅ Success:', response.data);
    console.log(`Found ${response.data.count} treatment plans`);
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function testSubmitProgress(planId) {
  console.log('\n=== Testing Submit Progress Report ===');
  try {
    const response = await axios.post(
      `${BASE_URL}/${planId}/progress`,
      {
        progressPercentage: 75,
        notes: 'Test progress report - Patient showing good improvement',
        attachments: []
      },
      {
        headers: {
          'Authorization': `Bearer ${STAFF_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Success:', response.data);
    console.log(`Updated progress to: ${response.data.updatedProgress}%`);
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function testSpecialistEndpoint() {
  console.log('\n=== Testing Specialist Treatment Plans Endpoint ===');
  try {
    const response = await axios.get(`${BASE_URL}/specialist`, {
      headers: {
        'Authorization': `Bearer ${SPECIALIST_TOKEN}`
      }
    });
    console.log('✅ Success:', response.data);
    console.log(`Found ${response.data.count} treatment plans`);
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Treatment Plan API Tests...\n');
  console.log('📝 Make sure to:');
  console.log('1. Start the backend server (npm start in backend folder)');
  console.log('2. Replace STAFF_TOKEN and SPECIALIST_TOKEN with real JWT tokens');
  console.log('3. Ensure you have test data in the database\n');

  // Test 1: Get caregiver's treatment plans
  const caregiverPlans = await testCaregiverEndpoint();
  
  if (caregiverPlans && caregiverPlans.treatmentPlans.length > 0) {
    // Test 2: Submit progress for the first plan
    const firstPlan = caregiverPlans.treatmentPlans[0];
    console.log(`\nTesting with plan: "${firstPlan.planTitle}"`);
    await testSubmitProgress(firstPlan.id);
  }

  // Test 3: Get specialist's treatment plans
  await testSpecialistEndpoint();

  console.log('\n✨ Tests completed!\n');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testCaregiverEndpoint, testSubmitProgress, testSpecialistEndpoint };
