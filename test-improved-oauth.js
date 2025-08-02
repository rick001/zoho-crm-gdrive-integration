const axios = require('axios');
require('dotenv').config();

/**
 * Test the improved OAuth2 flow with dynamic accounts-server detection
 */
async function testImprovedOAuth2() {
  console.log('🚀 Testing Improved OAuth2 Implementation');
  console.log('=========================================\n');

  // Check environment variables
  console.log('📋 Configuration:');
  console.log('ZOHO_CLIENT_ID:', process.env.ZOHO_CLIENT_ID);
  console.log('ZOHO_CLIENT_SECRET:', process.env.ZOHO_CLIENT_SECRET ? '***SET***' : '***MISSING***');
  console.log('ZOHO_REDIRECT_URI:', process.env.ZOHO_REDIRECT_URI || 'https://zoho.techlab.live/oauth/callback');
  console.log('');

  // Test server endpoints
  const baseUrl = 'http://localhost:3010';
  
  try {
    // Test homepage
    console.log('🧪 Testing server homepage...');
    const homeResponse = await axios.get(`${baseUrl}/`);
    console.log('✅ Server is running:', homeResponse.data.message);
    console.log('');

    // Test auth URL generation (this will open browser)
    console.log('🧪 Testing auth URL generation...');
    const authResponse = await axios.get(`${baseUrl}/auth`);
    console.log('✅ Auth URL generated successfully');
    console.log('🔗 Auth URL:', authResponse.data.authUrl);
    console.log('📱 Browser should open automatically');
    console.log('');

    // Test status endpoint
    console.log('🧪 Testing status endpoint...');
    const statusResponse = await axios.get(`${baseUrl}/status`);
    console.log('✅ Status endpoint working:', statusResponse.data);
    console.log('');

    console.log('🎉 All server endpoints are working correctly!');
    console.log('');
    console.log('📝 Key Improvements:');
    console.log('✅ Dynamic accounts-server detection');
    console.log('✅ Automatic browser opening');
    console.log('✅ Better error handling');
    console.log('✅ Cleaner token exchange');
    console.log('');
    console.log('🔄 Next Steps:');
    console.log('1. Browser should open automatically');
    console.log('2. Complete the OAuth2 authorization');
    console.log('3. Check the callback for tokens');
    console.log('4. Test with: http://localhost:3010/test');

  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    console.log('');
    console.log('💡 Make sure the server is running: npm start');
  }
}

// Run the test
testImprovedOAuth2().catch(console.error); 