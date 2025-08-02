/**
 * Deployment configuration
 * Update these settings based on your deployment
 */

module.exports = {
  // Custom field name for Google Drive link in Zoho CRM
  // Make sure this field exists in your Zoho CRM
  GOOGLE_DRIVE_LINK_FIELD: 'Google_Drive_Link',
  
  // Whether to append notes or replace them
  APPEND_NOTES: true,
  
  // Note template for Drive folder creation
  NOTE_TEMPLATE: (driveLink, dealName) => 
    `Google Drive folder created for deal "${dealName}" on ${new Date().toISOString()}: ${driveLink}`,
  
  // Webhook validation settings
  WEBHOOK_VALIDATION: {
    ENABLED: true,
    REQUIRE_SIGNATURE: false // Set to true in production
  },
  
  // Google Drive settings
  GOOGLE_DRIVE: {
    FOLDER_NAME_TEMPLATE: (dealName) => dealName,
    DESCRIPTION_TEMPLATE: (dealName, dealId) => 
      `Folder created for Zoho CRM deal: ${dealName} (ID: ${dealId})`
  }
}; 