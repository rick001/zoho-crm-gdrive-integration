const axios = require('axios');

// Test configuration
const WEBHOOK_URL = 'http://localhost:3000/zoho-webhook';
const TEST_DEALS = [
  {
    Deal_Name: "Acme Corp - Q1 2024",
    Deal_ID: "123456789",
    Stage: "Qualification",
    Amount: "50000",
    Owner: "John Doe",
    Closing_Date: "2024-03-31"
  },
  {
    Deal_Name: "TechStart - Software License",
    Deal_ID: "987654321",
    Stage: "Proposal",
    Amount: "75000",
    Owner: "Jane Smith",
    Closing_Date: "2024-04-15"
  },
  {
    Deal_Name: "Global Solutions - Consulting",
    Deal_ID: "456789123",
    Stage: "Negotiation",
    Amount: "120000",
    Owner: "Mike Johnson",
    Closing_Date: "2024-05-01"
  }
];

/**
 * Test webhook endpoint with sample deal data
 */
async function testWebhook(dealData) {
  try {
    console.log(`\n🧪 Testing webhook with deal: ${dealData.Deal_Name}`);
    
    const response = await axios.post(WEBHOOK_URL, dealData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Zoho-CRM-Webhook-Test'
      },
      timeout: 10000
    });

    console.log('✅ Webhook test successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Webhook test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

/**
 * Test health endpoint
 */
async function testHealth() {
  try {
    console.log('\n🏥 Testing health endpoint...');
    
    const response = await axios.get('http://localhost:3000/health');
    console.log('✅ Health check successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Health check failed!');
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Test homepage endpoint
 */
async function testHomepage() {
  try {
    console.log('\n🏠 Testing homepage endpoint...');
    
    const response = await axios.get('http://localhost:3000/');
    console.log('✅ Homepage test successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Homepage test failed!');
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting integration tests...\n');
  
  try {
    // Test basic endpoints
    await testHealth();
    await testHomepage();
    
    // Test webhook with each sample deal
    for (const deal of TEST_DEALS) {
      await testWebhook(deal);
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed!');
    console.error('Make sure the server is running on localhost:3000');
    console.error('Run: npm run dev');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testWebhook,
  testHealth,
  testHomepage,
  runTests
}; 