const axios = require('axios');
require('dotenv').config();

/**
 * Debug token exchange to see the actual response
 */
async function debugTokenExchange() {
  console.log('🔍 Debugging Zoho Token Exchange');
  console.log('==================================\n');

  const authCode = '1000.8c42a87b2281bc30dc865d58204d172a.0eec2ca0afa7b04beb7b7ea8d1b47a74';
  
  console.log('📋 Request Details:');
  console.log('Authorization Code:', authCode);
  console.log('Client ID:', process.env.ZOHO_CLIENT_ID);
  console.log('Client Secret:', process.env.ZOHO_CLIENT_SECRET);
  console.log('Redirect URI:', process.env.ZOHO_REDIRECT_URI);
  console.log('');

  try {
    console.log('🔄 Making token exchange request...');
    
    const requestData = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      redirect_uri: process.env.ZOHO_REDIRECT_URI,
      code: authCode
    });

    console.log('📤 Request Data:');
    console.log(requestData.toString());
    console.log('');

    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', 
      requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ Response received!');
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('📊 Full Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.access_token) {
      console.log('\n🎉 Token extraction successful!');
      console.log('Access Token (first 20 chars):', response.data.access_token.substring(0, 20) + '...');
      console.log('Refresh Token (first 20 chars):', response.data.refresh_token.substring(0, 20) + '...');
      console.log('Expires In:', response.data.expires_in, 'seconds');
      
      console.log('\n📋 .env Configuration:');
      console.log('==============================================');
      console.log(`ZOHO_CLIENT_ID=${process.env.ZOHO_CLIENT_ID}`);
      console.log(`ZOHO_CLIENT_SECRET=${process.env.ZOHO_CLIENT_SECRET}`);
      console.log(`ZOHO_REFRESH_TOKEN=${response.data.refresh_token}`);
      console.log(`ZOHO_REDIRECT_URI=${process.env.ZOHO_REDIRECT_URI}`);
      console.log('==============================================');
      console.log('\n💡 Copy these values to your .env file');
      
    } else {
      console.log('\n❌ No tokens found in response');
      console.log('Response keys:', Object.keys(response.data));
    }
    
  } catch (error) {
    console.error('❌ Error during token exchange:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Full Error:', error.message);
  }
}

// Run the debug
debugTokenExchange().catch(console.error); 