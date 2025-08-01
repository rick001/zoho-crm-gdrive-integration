const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Test the OAuth2 connection and deal update functionality
 */
async function testOAuth2Setup() {
  console.log('🧪 Testing Zoho OAuth2 Setup');
  console.log('==============================\n');

  // Check environment variables
  const requiredVars = [
    'ZOHO_CLIENT_ID',
    'ZOHO_CLIENT_SECRET', 
    'ZOHO_REFRESH_TOKEN',
    'ZOHO_REDIRECT_URI'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.log('Please set these in your .env file');
    return false;
  }

  console.log('✅ Environment variables configured');
  console.log('Client ID:', process.env.ZOHO_CLIENT_ID);
  console.log('Redirect URI:', process.env.ZOHO_REDIRECT_URI);
  console.log('');

  try {
    // Step 1: Test token refresh
    console.log('🔄 Step 1: Testing token refresh...');
    const tokenResponse = await axios.post('https://accounts.zoho.com/oauth/v2/token', 
      new URLSearchParams({
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;
    console.log('✅ Token refresh successful');
    console.log('Access Token:', accessToken.substring(0, 20) + '...');
    console.log('Expires In:', tokenResponse.data.expires_in, 'seconds');
    console.log('');

    // Step 2: Test API connection
    console.log('🔄 Step 2: Testing API connection...');
    const orgResponse = await axios.get('https://www.zohoapis.com/crm/v2/org', {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API connection successful');
    console.log('Organization:', orgResponse.data.org?.[0]?.name || 'Unknown');
    console.log('');

    // Step 3: Test deal retrieval
    console.log('🔄 Step 3: Testing deal retrieval...');
    const dealsResponse = await axios.get('https://www.zohoapis.com/crm/v2/Deals', {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        per_page: 1
      }
    });

    const deals = dealsResponse.data.data || [];
    if (deals.length === 0) {
      console.log('⚠️  No deals found in CRM');
      console.log('You may need to create a test deal first');
    } else {
      console.log('✅ Deal retrieval successful');
      console.log('Sample Deal:', {
        id: deals[0].id,
        name: deals[0].Deal_Name,
        stage: deals[0].Stage
      });
    }
    console.log('');

    // Step 4: Test deal update (optional)
    if (deals.length > 0) {
      const testUpdate = await new Promise((resolve) => {
        rl.question('🧪 Step 4: Would you like to test updating a deal with a Google Drive link? (y/n): ', (answer) => {
          resolve(answer.toLowerCase() === 'y');
        });
      });

      if (testUpdate) {
        const dealId = deals[0].id;
        const testDriveLink = 'https://drive.google.com/drive/folders/test-folder-id';
        
        console.log(`🔄 Testing deal update for deal ${dealId}...`);
        
        const updateResponse = await axios.put(`https://www.zohoapis.com/crm/v2/Deals/${dealId}`, {
          data: [{
            id: dealId,
            Google_Drive_Link: testDriveLink
          }]
        }, {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Deal update test successful');
        console.log('Response:', updateResponse.data);
        console.log('');
      }
    }

    // Step 5: Test webhook endpoint
    console.log('🔄 Step 5: Testing webhook endpoint...');
    const webhookUrl = process.env.WEBHOOK_URL || 'https://zoho.techlab.live/zoho-webhook';
    
    try {
      const webhookResponse = await axios.post(webhookUrl, {
        Deal_Name: 'Test Deal',
        Deal_ID: 'test-deal-id',
        Stage: 'Qualification',
        Amount: 1000,
        Created_Time: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Webhook endpoint test successful');
      console.log('Response:', webhookResponse.data);
    } catch (webhookError) {
      console.log('⚠️  Webhook endpoint test failed (this is expected if server is not running)');
      console.log('Error:', webhookError.message);
    }

    console.log('\n🎉 OAuth2 setup test completed successfully!');
    console.log('Your integration is ready for deployment.');
    
    return true;

  } catch (error) {
    console.error('❌ OAuth2 setup test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 This usually means your refresh token is invalid or expired.');
      console.log('Please re-run the OAuth2 authorization flow:');
      console.log('1. Run: npm run setup-oauth');
      console.log('2. Follow the prompts to get a new refresh token');
      console.log('3. Update your .env file with the new refresh token');
    }
    
    return false;
  }
}

/**
 * Generate OAuth2 authorization URL
 */
function generateAuthUrl() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const redirectUri = process.env.ZOHO_REDIRECT_URI || 'https://zoho.techlab.live/oauth/callback';
  
  return `https://accounts.zoho.com/oauth/v2/auth?` +
    `scope=ZohoCRM.modules.ALL&` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}`;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Zoho OAuth2 Test Suite');
  console.log('==========================\n');

  const success = await testOAuth2Setup();
  
  if (!success) {
    console.log('\n🔗 To set up OAuth2, visit this URL:');
    console.log(generateAuthUrl());
    console.log('\nThen run: npm run setup-oauth');
  }

  rl.close();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testOAuth2Setup,
  generateAuthUrl
}; 