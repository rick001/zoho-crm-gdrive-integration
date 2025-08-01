const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Extract authorization code from callback URL
 */
function extractCodeFromUrl(url) {
  const codeMatch = url.match(/[?&]code=([^&]+)/);
  return codeMatch ? codeMatch[1] : null;
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
 * Main function
 */
async function main() {
  console.log('🔍 Zoho OAuth Token Extractor');
  console.log('===============================\n');

  // Check if environment variables are set
  if (!process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_CLIENT_SECRET) {
    console.error('❌ Missing environment variables!');
    console.log('Please set ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET in your .env file');
    process.exit(1);
  }

  console.log('📋 Current Configuration:');
  console.log('Client ID:', process.env.ZOHO_CLIENT_ID);
  console.log('Client Secret:', process.env.ZOHO_CLIENT_SECRET);
  console.log('Redirect URI:', process.env.ZOHO_REDIRECT_URI);
  console.log('');

  // Get the callback URL from user
  const callbackUrl = await new Promise((resolve) => {
    rl.question('📝 Paste the full callback URL from your browser: ', (url) => {
      resolve(url.trim());
    });
  });

  if (!callbackUrl) {
    console.error('❌ No callback URL provided');
    rl.close();
    process.exit(1);
  }

  // Extract the authorization code
  const authCode = extractCodeFromUrl(callbackUrl);
  
  if (!authCode) {
    console.error('❌ Could not extract authorization code from URL');
    console.log('Make sure the URL contains a "code" parameter');
    rl.close();
    process.exit(1);
  }

  console.log('✅ Authorization code extracted:', authCode.substring(0, 20) + '...');
  console.log('');

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(authCode);
    
    // Display final configuration
    console.log('\n🎉 Success! Here\'s your .env configuration:');
    console.log('==============================================');
    console.log(`ZOHO_CLIENT_ID=${process.env.ZOHO_CLIENT_ID}`);
    console.log(`ZOHO_CLIENT_SECRET=${process.env.ZOHO_CLIENT_SECRET}`);
    console.log(`ZOHO_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`ZOHO_REDIRECT_URI=${process.env.ZOHO_REDIRECT_URI}`);
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
  extractCodeFromUrl,
  exchangeCodeForToken
}; 