const axios = require('axios');
require('dotenv').config();

/**
 * Debug the exact response structure from token exchange
 */
async function debugResponse() {
  console.log('🔍 Debugging Token Exchange Response');
  console.log('=====================================\n');

  const authCode = '1000.8c42a87b2281bc30dc865d58204d172a.0eec2ca0afa7b04beb7b7ea8d1b47a74';
  
  try {
    console.log('🔄 Making token exchange request...');
    
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: process.env.ZOHO_REDIRECT_URI,
        code: authCode
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ Response received!');
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Type:', typeof response.data);
    console.log('📊 Response Keys:', Object.keys(response.data));
    console.log('📊 Full Response:', JSON.stringify(response.data, null, 2));
    
    // Check if it's a string that needs parsing
    if (typeof response.data === 'string') {
      console.log('\n🔍 Response is a string, trying to parse as JSON...');
      try {
        const parsed = JSON.parse(response.data);
        console.log('📊 Parsed Response:', JSON.stringify(parsed, null, 2));
      } catch (parseError) {
        console.log('❌ Failed to parse as JSON:', parseError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during token exchange:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Response Type:', typeof error.response?.data);
    console.error('Full Error:', error.message);
  }
}

debugResponse().catch(console.error); 