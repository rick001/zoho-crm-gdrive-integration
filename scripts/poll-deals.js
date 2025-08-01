const zohoAuth = require('../utils/zohoAuth');
const { createGoogleDriveFolder } = require('../utils/googleDrive');
const config = require('../config/deployment');

/**
 * Poll for new deals and create Google Drive folders
 */
async function pollForNewDeals() {
  try {
    console.log('🔍 Polling for new deals...');
    
    // Get all deals from Zoho CRM
    const deals = await zohoAuth.makeRequest('Deals', {
      method: 'GET',
      params: {
        fields: 'Deal_Name,Deal_ID,Stage,Amount,Created_Time,Google_Drive_Link'
      }
    });

    if (!deals.data || deals.data.length === 0) {
      console.log('📭 No deals found');
      return;
    }

    console.log(`📋 Found ${deals.data.length} deals`);

    // Filter deals created after deployment date
    const deploymentDate = new Date(config.DEPLOYMENT_DATE);
    const newDeals = deals.data.filter(deal => {
      const dealCreatedDate = new Date(deal.Created_Time);
      return dealCreatedDate >= deploymentDate && !deal.Google_Drive_Link;
    });

    console.log(`🆕 Found ${newDeals.length} new deals after deployment date`);

    // Process each new deal
    for (const deal of newDeals) {
      try {
        console.log(`\n📁 Processing deal: ${deal.Deal_Name} (ID: ${deal.Deal_ID})`);
        
        // Create Google Drive folder
        const folderId = await createGoogleDriveFolder(deal.Deal_Name, {
          dealId: deal.Deal_ID,
          stage: deal.Stage,
          amount: deal.Amount
        });

        const driveLink = `https://drive.google.com/drive/folders/${folderId}`;
        console.log(`✅ Created folder: ${driveLink}`);

        // Update the deal with Drive link
        const updateData = {
          id: deal.Deal_ID,
          [config.GOOGLE_DRIVE_LINK_FIELD]: driveLink
        };

        await zohoAuth.updateDeal(deal.Deal_ID, updateData);
        console.log(`✅ Updated deal with Drive link`);

        // Add note about folder creation
        if (config.APPEND_NOTES) {
          const noteContent = config.NOTE_TEMPLATE(driveLink, deal.Deal_Name);
          await zohoAuth.appendDealNote(deal.Deal_ID, noteContent);
          console.log(`✅ Added note to deal`);
        }

        console.log(`🎉 Successfully processed deal: ${deal.Deal_Name}`);

      } catch (error) {
        console.error(`❌ Error processing deal ${deal.Deal_ID}:`, error.message);
      }
    }

    console.log(`\n✅ Polling complete. Processed ${newDeals.length} deals.`);

  } catch (error) {
    console.error('❌ Error polling for deals:', error.message);
  }
}

/**
 * Run the polling script
 */
async function main() {
  console.log('🚀 Starting Zoho CRM to Google Drive polling...');
  console.log(`📅 Deployment date: ${config.DEPLOYMENT_DATE}`);
  console.log(`🔗 Drive link field: ${config.GOOGLE_DRIVE_LINK_FIELD}`);
  
  await pollForNewDeals();
  
  console.log('✅ Polling script completed');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  pollForNewDeals,
  main
}; 