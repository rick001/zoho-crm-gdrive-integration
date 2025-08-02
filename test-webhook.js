const axios = require('axios');
require('dotenv').config();

/**
 * Test the webhook functionality
 */
async function testWebhook() {
  console.log('🧪 Testing Webhook Functionality');
  console.log('================================\n');

  const baseUrl = process.env.BASE_URL || 'http://localhost:3010';
  
  // Sample webhook payload
  const webhookPayload = {
    Deal_Name: 'Test Deal - Webhook Integration',
    Deal_ID: '123456789',
    Stage: 'Qualification',
    Amount: '50000',
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

  } catch (error) {
    console.error('❌ Webhook test failed:');
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data || error.message);
  }
}

// Run the test
testWebhook().catch(console.error); 