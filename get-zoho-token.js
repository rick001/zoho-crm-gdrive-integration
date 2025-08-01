const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Zoho OAuth2 Configuration
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REDIRECT_URI = process.env.ZOHO_REDIRECT_URI || 'https://zoho.techlab.live/oauth/callback';

/**
 * Generate the authorization URL for Zoho OAuth2
 */
function generateAuthUrl() {
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?` +
    `response_type=code&` +
    `client_id=${ZOHO_CLIENT_ID}&` +
    `scope=ZohoCRM.modules.ALL,ZohoCRM.settings.ALL&` +
    `redirect_uri=${encodeURIComponent(ZOHO_REDIRECT_URI)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  return authUrl;
}

/**
 * Exchange authorization code for access token and refresh token
 */
async function exchangeCodeForToken(authorizationCode) {
  try {
    console.log('🔄 Exchanging authorization code for tokens...');
    
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', {
      code: authorizationCode,
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      redirect_uri: ZOHO_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    console.log('✅ Tokens obtained successfully!');
    console.log('\n📋 Token Information:');
    console.log('Access Token:', response.data.access_token);
    console.log('Refresh Token:', response.data.refresh_token);
    console.log('Expires In:', response.data.expires_in, 'seconds');
    console.log('Token Type:', response.data.token_type);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error exchanging code for tokens:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test the access token by making a simple API call
 */
async function testAccessToken(accessToken) {
  try {
    console.log('\n🧪 Testing access token...');
    
    const response = await axios.get('https://www.zohoapis.com/crm/v3/org', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Access token is valid!');
    console.log('Organization:', response.data.org?.[0]?.name || 'Unknown');
    
    return true;
    
  } catch (error) {
    console.error('❌ Access token test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Main function to guide through the OAuth2 flow
 */
async function main() {
  console.log('🚀 Zoho OAuth2 Token Generator');
  console.log('================================\n');

  // Check if environment variables are set
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET) {
    console.error('❌ Missing environment variables!');
    console.log('Please set the following in your .env file:');
    console.log('- ZOHO_CLIENT_ID');
    console.log('- ZOHO_CLIENT_SECRET');
    console.log('- ZOHO_REDIRECT_URI (optional, defaults to https://zoho.techlab.live/oauth/callback)');
    process.exit(1);
  }

  console.log('📋 Current Configuration:');
  console.log('Client ID:', ZOHO_CLIENT_ID);
  console.log('Client Secret:', ZOHO_CLIENT_SECRET);
  console.log('Redirect URI:', ZOHO_REDIRECT_URI);
  console.log('');

  // Step 1: Generate authorization URL
  const authUrl = generateAuthUrl();
  console.log('🔗 Step 1: Open this URL in your browser to authorize:');
  console.log(authUrl);
  console.log('');

  // Step 2: Get authorization code from user
  const authCode = await new Promise((resolve) => {
    rl.question('📝 Step 2: Enter the authorization code from the redirect URL: ', (code) => {
      resolve(code.trim());
    });
  });

  if (!authCode) {
    console.error('❌ No authorization code provided');
    rl.close();
    process.exit(1);
  }

  try {
    // Step 3: Exchange code for tokens
    const tokens = await exchangeCodeForToken(authCode);
    
    // Step 4: Test the access token
    await testAccessToken(tokens.access_token);
    
    // Step 5: Display final configuration
    console.log('\n🎉 Success! Here\'s your .env configuration:');
    console.log('==============================================');
    console.log(`ZOHO_CLIENT_ID=${ZOHO_CLIENT_ID}`);
    console.log(`ZOHO_CLIENT_SECRET=${ZOHO_CLIENT_SECRET}`);
    console.log(`ZOHO_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`ZOHO_REDIRECT_URI=${ZOHO_REDIRECT_URI}`);
    console.log('==============================================');
    console.log('\n💡 Copy these values to your .env file');
    console.log('🔒 Keep your refresh token secure - it\'s used to get new access tokens');
    
  } catch (error) {
    console.error('\n💥 Failed to get tokens:', error.message);
  }

  rl.close();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateAuthUrl,
  exchangeCodeForToken,
  testAccessToken
}; 