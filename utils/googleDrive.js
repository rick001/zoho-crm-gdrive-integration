const { google } = require('googleapis');
const path = require('path');

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Create a folder in Google Drive
 * @param {string} folderName - Name of the folder to create
 * @param {Object} metadata - Additional metadata for the folder
 * @returns {Promise<string>} - Folder ID
 */
async function createGoogleDriveFolder(folderName, metadata = {}) {
  try {
    console.log(`Creating folder: ${folderName}`);
    
    // Sanitize folder name (remove invalid characters)
    const sanitizedName = sanitizeFolderName(folderName);
    
    const folderMetadata = {
      name: sanitizedName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID],
      description: `Folder created for Zoho CRM deal: ${folderName}`,
      properties: {
        dealName: folderName,
        dealId: metadata.dealId || '',
        stage: metadata.stage || '',
        amount: metadata.amount || '',
        createdBy: 'zoho-crm-integration',
        createdAt: new Date().toISOString()
      }
    };

    const response = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id,name,webViewLink'
    });

    console.log(`✅ Folder created successfully: ${response.data.name} (ID: ${response.data.id})`);
    console.log(`🔗 Folder link: ${response.data.webViewLink}`);

    return response.data.id;

  } catch (error) {
    console.error('❌ Error creating Google Drive folder:', error);
    throw new Error(`Failed to create folder in Google Drive: ${error.message}`);
  }
}

/**
 * Sanitize folder name to comply with Google Drive naming restrictions
 * @param {string} name - Original folder name
 * @returns {string} - Sanitized folder name
 */
function sanitizeFolderName(name) {
  if (!name) return 'Untitled Deal';
  
  // Remove or replace invalid characters
  let sanitized = name
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters with underscore
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  // Limit length (Google Drive has a limit)
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }
  
  // Ensure it's not empty
  if (!sanitized) {
    sanitized = 'Untitled Deal';
  }
  
  return sanitized;
}

/**
 * Get folder information by ID
 * @param {string} folderId - Google Drive folder ID
 * @returns {Promise<Object>} - Folder information
 */
async function getFolderInfo(folderId) {
  try {
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id,name,webViewLink,createdTime,properties'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting folder info:', error);
    throw new Error(`Failed to get folder info: ${error.message}`);
  }
}

/**
 * List folders in the parent directory
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} - List of folders
 */
async function listFolders(maxResults = 10) {
  try {
    const response = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id,name,webViewLink,createdTime)',
      orderBy: 'createdTime desc',
      pageSize: maxResults
    });
    
    return response.data.files;
  } catch (error) {
    console.error('Error listing folders:', error);
    throw new Error(`Failed to list folders: ${error.message}`);
  }
}

module.exports = {
  createGoogleDriveFolder,
  getFolderInfo,
  listFolders,
  sanitizeFolderName
}; 