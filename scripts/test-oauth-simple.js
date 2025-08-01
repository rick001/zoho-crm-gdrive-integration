const axios = require('axios');
require('dotenv').config();

/**
 * Simple OAuth2 test to verify the flow
 */
async function testOAuth2Flow() {
  console.log('🧪 Simple OAuth2 Test');
  console.log('======================\n');

  // Test 1: Check if we can access the authorization URL
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=${process.env.ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${encodeURIComponent(process.env.ZOHO_REDIRECT_URI)}`;
  
  console.log('🔗 Authorization URL:');
  console.log(authUrl);
  console.log('');

  // Test 2: Try a simple token exchange with a dummy code
  console.log('🔄 Testing token exchange endpoint...');
  
  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: process.env.ZOHO_REDIRECT_URI,
        code: 'dummy_code_for_testing'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
  } catch (error) {
    console.log('✅ Token endpoint is accessible');
    console.log('Expected error for dummy code:', error.response?.data?.error);
    console.log('');
  }

  // Test 3: Check environment variables
  console.log('📋 Environment Variables Check:');
  console.log('ZOHO_CLIENT_ID:', process.env.ZOHO_CLIENT_ID ? '✅ Set' : '❌ Missing');
  console.log('ZOHO_CLIENT_SECRET:', process.env.ZOHO_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
  console.log('ZOHO_REDIRECT_URI:', process.env.ZOHO_REDIRECT_URI ? '✅ Set' : '❌ Missing');
  console.log('');

  // Test 4: Generate a fresh authorization URL
  console.log('🔄 Generating fresh authorization URL...');
  console.log('Please visit this URL in your browser:');
  console.log(authUrl);
  console.log('');
  console.log('After authorization, you should be redirected to:');
  console.log(`${process.env.ZOHO_REDIRECT_URI}?code=FRESH_AUTHORIZATION_CODE&location=in&accounts-server=ht...`);
  console.log('');
  console.log('⚠️  Important:');
  console.log('- Authorization codes expire in 10 minutes');
  console.log('- Each code can only be used once');
  console.log('- Use the code immediately after getting it');
}

testOAuth2Flow().catch(console.error); 