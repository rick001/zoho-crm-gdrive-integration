require('dotenv').config();

/**
 * Check and display current environment configuration
 */
function checkEnvConfig() {
  console.log('🔍 Environment Configuration Check');
  console.log('=====================================');
  
  const config = {
    ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID,
    ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET ? '***SET***' : '***MISSING***',
    ZOHO_REDIRECT_URI: process.env.ZOHO_REDIRECT_URI,
    ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN ? '***SET***' : '***MISSING***',
    PORT: process.env.PORT || 3010,
    NODE_ENV: process.env.NODE_ENV || 'development'
  };

  console.log('Current Configuration:');
  Object.entries(config).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });

  console.log('\n🔗 Generated Authorization URL:');
  const clientId = process.env.ZOHO_CLIENT_ID;
  const redirectUri = process.env.ZOHO_REDIRECT_URI || 'https://zoho.techlab.live/oauth/callback';
  
  if (clientId) {
    const authUrl = `https://accounts.zoho.com/oauth/v2/auth?` +
      `scope=ZohoCRM.modules.ALL&` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    console.log(authUrl);
  } else {
    console.log('❌ ZOHO_CLIENT_ID is not set!');
  }

  console.log('\n📋 Issues Found:');
  if (!process.env.ZOHO_CLIENT_ID) {
    console.log('❌ ZOHO_CLIENT_ID is missing');
  }
  if (!process.env.ZOHO_CLIENT_SECRET) {
    console.log('❌ ZOHO_CLIENT_SECRET is missing');
  }
  if (!process.env.ZOHO_REFRESH_TOKEN) {
    console.log('⚠️  ZOHO_REFRESH_TOKEN is missing (will be obtained via OAuth flow)');
  }

  console.log('\n💡 Recommendations:');
  console.log('1. Make sure your .env file has the correct ZOHO_CLIENT_ID');
  console.log('2. Use the working client ID: 1000.P3MHUQ3MOROF8BJT1U6M1G0PC0PX9J');
  console.log('3. Ensure ZOHO_REDIRECT_URI matches your Zoho app configuration');
}

// Run the check
checkEnvConfig(); 