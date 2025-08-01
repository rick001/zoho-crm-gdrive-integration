const zohoAuth = require('../utils/zohoAuth');
const config = require('../config/deployment');

/**
 * Test Zoho CRM API connection and list deals
 */
async function testZohoAPI() {
  try {
    console.log('🧪 Testing Zoho CRM API connection...');
    
    // Test 1: Get organization info
    console.log('\n📋 Test 1: Getting organization info...');
    const org = await zohoAuth.makeRequest('org');
    console.log('✅ Organization:', org.org?.[0]?.name || 'Unknown');
    
    // Test 2: Get deals
    console.log('\n📋 Test 2: Getting deals...');
    const deals = await zohoAuth.makeRequest('Deals', {
      method: 'GET',
      params: {
        fields: 'Deal_Name,Deal_ID,Stage,Amount,Created_Time'
      }
    });

    if (!deals.data || deals.data.length === 0) {
      console.log('📭 No deals found');
      return;
    }

    console.log(`✅ Found ${deals.data.length} deals`);
    
    // Show first 3 deals
    console.log('\n📋 Sample deals:');
    deals.data.slice(0, 3).forEach((deal, index) => {
      console.log(`${index + 1}. ${deal.Deal_Name} (ID: ${deal.Deal_ID}) - ${deal.Stage} - $${deal.Amount}`);
    });

    // Test 3: Check deployment date filtering
    console.log('\n📋 Test 3: Checking deployment date filtering...');
    const deploymentDate = new Date(config.DEPLOYMENT_DATE);
    console.log(`📅 Deployment date: ${config.DEPLOYMENT_DATE}`);
    
    const newDeals = deals.data.filter(deal => {
      const dealCreatedDate = new Date(deal.Created_Time);
      return dealCreatedDate >= deploymentDate;
    });

    console.log(`🆕 Deals created after deployment date: ${newDeals.length}`);
    
    if (newDeals.length > 0) {
      console.log('\n📋 New deals:');
      newDeals.forEach((deal, index) => {
        console.log(`${index + 1}. ${deal.Deal_Name} (Created: ${deal.Created_Time})`);
      });
    }

    console.log('\n✅ Zoho API test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing Zoho API:', error.message);
    console.error('💡 Make sure your Zoho credentials are set in .env file');
  }
}

// Run if called directly
if (require.main === module) {
  testZohoAPI().catch(console.error);
}

module.exports = {
  testZohoAPI
}; 