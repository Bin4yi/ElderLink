// backend/scripts/test-password-reset.js
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const TEST_EMAIL = 'test@example.com'; // Change to a real email for testing

async function testPasswordResetFlow() {
  console.log('🧪 Testing Password Reset Flow...\n');

  try {
    // Step 1: Request OTP
    console.log('📧 Step 1: Requesting OTP for', TEST_EMAIL);
    const requestResponse = await axios.post(`${API_BASE}/password-reset/request`, {
      email: TEST_EMAIL
    });
    console.log('✅ OTP Request Response:', requestResponse.data);
    console.log('   Message:', requestResponse.data.message);
    console.log('   Expires in:', requestResponse.data.expiresIn, 'seconds\n');

    // Step 2: Prompt for OTP (in real scenario, user would get this via email)
    console.log('📬 Step 2: Check your email for the OTP code');
    console.log('   Email:', TEST_EMAIL);
    console.log('   Subject: "🔐 Password Reset OTP - ElderLink"\n');

    // For testing, you would need to manually enter the OTP here
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Enter the 6-digit OTP from email: ', async (otp) => {
      try {
        // Step 3: Verify OTP
        console.log('\n🔍 Step 3: Verifying OTP...');
        const verifyResponse = await axios.post(`${API_BASE}/password-reset/verify-otp`, {
          email: TEST_EMAIL,
          otp: otp
        });
        console.log('✅ OTP Verification Response:', verifyResponse.data);
        console.log('   Message:', verifyResponse.data.message);
        console.log('   Reset Token:', verifyResponse.data.resetToken, '\n');

        // Step 4: Reset Password
        const newPassword = 'NewTestPassword123!';
        console.log('🔐 Step 4: Resetting password...');
        const resetResponse = await axios.post(`${API_BASE}/password-reset/reset`, {
          email: TEST_EMAIL,
          otp: otp,
          newPassword: newPassword
        });
        console.log('✅ Password Reset Response:', resetResponse.data);
        console.log('   Message:', resetResponse.data.message, '\n');

        console.log('🎉 Password Reset Flow Completed Successfully!');
        console.log('   You can now login with:');
        console.log('   Email:', TEST_EMAIL);
        console.log('   Password:', newPassword);

      } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
      } finally {
        readline.close();
        process.exit(0);
      }
    });

  } catch (error) {
    console.error('❌ Error in Step 1 (Request OTP):', error.response?.data || error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE}/health`);
    console.log('✅ Server is running at', API_BASE, '\n');
    testPasswordResetFlow();
  } catch (error) {
    console.error('❌ Server is not running!');
    console.error('   Please start the backend server first:');
    console.error('   cd backend && npm run dev\n');
    process.exit(1);
  }
}

checkServer();
