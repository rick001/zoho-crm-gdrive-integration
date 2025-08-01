const axios = require('axios');
require('dotenv').config();

/**
 * Check if the server has stored tokens and retrieve them
 */
async function getServerTokens() {
  console.log('🔍 Checking Server Token Storage');
  console.log('================================\n');

  try {
    // Check auth status
    console.log('🔄 Checking server auth status...');
    const statusResponse = await axios.get('https://zoho.techlab.live/auth/status');
    console.log('📊 Auth Status:', statusResponse.data);
    
    if (statusResponse.data.hasTokens) {
      console.log('✅ Server has tokens stored!');
      return true;
    } else {
      console.log('❌ Server has no tokens stored');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error checking server status:', error.message);
    return false;
  }
}

/**
 * Test the OAuth2 flow with a fresh authorization
 */
async function testFreshAuthorization() {
  console.log('\n🔄 Testing fresh authorization...');
  
  // Generate a fresh authorization URL
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=${process.env.ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${encodeURIComponent(process.env.ZOHO_REDIRECT_URI)}`;
  
  console.log('🔗 Fresh Authorization URL:');
  console.log(authUrl);
  console.log('');
  console.log('📝 Instructions:');
  console.log('1. Open the URL above in your browser');
  console.log('2. Authorize the application');
  console.log('3. Copy the full callback URL');
  console.log('4. Use: npm run extract-token');
  console.log('');
  console.log('⚠️  Important: Use the code immediately after getting it!');
}

async function main() {
  const hasTokens = await getServerTokens();
  
  if (!hasTokens) {
    await testFreshAuthorization();
  }
}

main().catch(console.error); 