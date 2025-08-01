const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Generate the authorization URL for Zoho OAuth2
 */
function generateAuthUrl() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const redirectUri = process.env.ZOHO_REDIRECT_URI || 'https://zoho.techlab.live/oauth/callback';
  
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?` +
    `scope=ZohoCRM.modules.ALL&` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}`;

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForToken(authorizationCode) {
  try {
    console.log('🔄 Exchanging authorization code for tokens...');
    
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: process.env.ZOHO_REDIRECT_URI,
        code: authorizationCode
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

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
    
    const response = await axios.get('https://www.zohoapis.com/crm/v2/org', {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
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
 * Test updating a deal with Google Drive link
 */
async function testDealUpdate(accessToken, dealId, driveLink) {
  try {
    console.log(`\n🧪 Testing deal update for deal ${dealId}...`);
    
    const response = await axios.put(`https://www.zohoapis.com/crm/v2/Deals/${dealId}`, {
      data: [{
        id: dealId,
        Google_Drive_Link: driveLink
      }]
    }, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Deal update test successful!');
    console.log('Response:', response.data);
    
    return true;
    
  } catch (error) {
    console.error('❌ Deal update test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Main function to guide through the OAuth2 setup
 */
async function main() {
  console.log('🚀 Zoho OAuth2 Setup Guide');
  console.log('============================\n');

  // Check if environment variables are set
  if (!process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_CLIENT_SECRET) {
    console.error('❌ Missing environment variables!');
    console.log('Please set the following in your .env file:');
    console.log('- ZOHO_CLIENT_ID');
    console.log('- ZOHO_CLIENT_SECRET');
    console.log('- ZOHO_REDIRECT_URI (optional, defaults to https://zoho.techlab.live/oauth/callback)');
    process.exit(1);
  }

  console.log('📋 Current Configuration:');
  console.log('Client ID:', process.env.ZOHO_CLIENT_ID);
  console.log('Client Secret:', process.env.ZOHO_CLIENT_SECRET);
  console.log('Redirect URI:', process.env.ZOHO_REDIRECT_URI);
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
    
    // Step 5: Optional - Test deal update
    const testDealUpdate = await new Promise((resolve) => {
      rl.question('\n🧪 Step 5: Would you like to test updating a deal? (y/n): ', (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });

    if (testDealUpdate) {
      const dealId = await new Promise((resolve) => {
        rl.question('Enter a deal ID to test: ', (id) => {
          resolve(id.trim());
        });
      });

      const driveLink = await new Promise((resolve) => {
        rl.question('Enter a Google Drive link to test with: ', (link) => {
          resolve(link.trim());
        });
      });

      await testDealUpdate(tokens.access_token, dealId, driveLink);
    }
    
    // Step 6: Display final configuration
    console.log('\n🎉 Success! Here\'s your .env configuration:');
    console.log('==============================================');
    console.log(`ZOHO_CLIENT_ID=${process.env.ZOHO_CLIENT_ID}`);
    console.log(`ZOHO_CLIENT_SECRET=${process.env.ZOHO_CLIENT_SECRET}`);
    console.log(`ZOHO_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`ZOHO_REDIRECT_URI=${process.env.ZOHO_REDIRECT_URI}`);
    console.log('==============================================');
    console.log('\n💡 Copy these values to your .env file');
    console.log('🔒 Keep your refresh token secure - it\'s used to get new access tokens');
    console.log('\n🚀 You can now deploy your server and it will automatically handle token refresh!');
    
  } catch (error) {
    console.error('\n💥 Failed to complete OAuth2 setup:', error.message);
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
  testAccessToken,
  testDealUpdate
}; 