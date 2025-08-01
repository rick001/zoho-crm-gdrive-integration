require('dotenv').config();

/**
 * Generate the correct production OAuth URL with prompt=consent
 */
function generateProductionOAuthUrl() {
  console.log('🔗 Production OAuth URL Generator');
  console.log('==================================\n');

  const clientId = process.env.ZOHO_CLIENT_ID;
  const redirectUri = 'https://zoho.techlab.live/oauth/callback';
  
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?` +
    `scope=ZohoCRM.modules.ALL&` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}`;

  console.log('✅ Correct Production OAuth URL:');
  console.log('==============================================');
  console.log(authUrl);
  console.log('==============================================');
  console.log('');
  console.log('🔍 Key Parameters:');
  console.log('- scope=ZohoCRM.modules.ALL');
  console.log('- client_id=' + clientId);
  console.log('- response_type=code');
  console.log('- access_type=offline');
  console.log('- prompt=consent (forces consent screen)');
  console.log('- redirect_uri=https://zoho.techlab.live/oauth/callback');
  console.log('');
  console.log('📝 Instructions:');
  console.log('1. Copy the URL above');
  console.log('2. Open it in your browser');
  console.log('3. Authorize the application');
  console.log('4. You should be redirected to:');
  console.log('   https://zoho.techlab.live/oauth/callback?code=FRESH_CODE&...');
  console.log('5. The response should include the refresh token');
}

generateProductionOAuthUrl(); 