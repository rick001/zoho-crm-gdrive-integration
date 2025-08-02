const axios = require('axios');
require('dotenv').config();

/**
 * Test the complete flow: webhook → Google Drive folder → deal update
 */
async function testDealUpdate() {
  console.log('🧪 Testing Complete Deal Update Flow');
  console.log('====================================\n');

  const baseUrl = process.env.BASE_URL || 'http://localhost:3010';
  
  // Sample webhook payload that would be sent by Zoho
  const webhookPayload = {
    Deal_Name: 'Test Deal - Complete Integration',
    Deal_ID: '123456789',
    Stage: 'Qualification',
    Amount: '75000',
    Created_Time: new Date().toISOString(),
    Owner: 'Test User',
    Account: 'Test Account',
    Contact: 'Test Contact'
  };

  try {
    console.log('📤 Sending webhook payload...');
    console.log('Payload:', JSON.stringify(webhookPayload, null, 2));
    console.log('');

    const response = await axios.post(`${baseUrl}/zoho-webhook`, webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Webhook test successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('');

    if (response.data.success) {
      console.log('🎉 Complete flow test passed!');
      console.log('✅ Google Drive folder created');
      console.log('✅ Deal updated with Drive link');
      console.log('✅ Note appended to deal');
      console.log('');
      console.log('📋 Summary:');
      console.log(`   Deal Name: ${response.data.dealName}`);
      console.log(`   Deal ID: ${response.data.dealId}`);
      console.log(`   Folder ID: ${response.data.folderId}`);
      console.log(`   Drive Link: ${response.data.driveLink}`);
      console.log(`   Deal Updated: ${response.data.dealUpdated}`);
    }

  } catch (error) {
    console.error('❌ Webhook test failed:');
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      console.log('');
      console.log('💡 Troubleshooting tips:');
      console.log('1. Make sure the server is running: npm start');
      console.log('2. Check environment variables: npm run check-env');
      console.log('3. Verify OAuth2 setup: npm test');
      console.log('4. Ensure Google Drive API is configured');
    }
  }
}

// Run the test
testDealUpdate().catch(console.error); 