require('dotenv').config();

/**
 * Generate OAuth2 authorization URL for manual use
 */
function generateAuthUrl() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const redirectUri = process.env.ZOHO_REDIRECT_URI || 'https://zoho.techlab.live/oauth/callback';
  
  if (!clientId) {
    console.error('❌ ZOHO_CLIENT_ID is not set in your .env file');
    return;
  }
  
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?` +
    `scope=ZohoCRM.modules.ALL&` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}`;

  console.log('🔗 OAuth2 Authorization URL:');
  console.log('=====================================');
  console.log(authUrl);
  console.log('=====================================');
  console.log('');
  console.log('📝 Instructions:');
  console.log('1. Copy the URL above');
  console.log('2. Open it in your browser');
  console.log('3. Authorize the application');
  console.log('4. You will be redirected to your callback URL');
  console.log('5. Copy the authorization code from the URL');
  console.log('6. Use the code to get your refresh token');
}

// Run the script
generateAuthUrl(); 