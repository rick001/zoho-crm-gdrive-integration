const express = require('express');
const axios = require('axios');
require('dotenv').config();

const { createGoogleDriveFolder } = require('./utils/googleDrive');
const { validateWebhook, extractDealInfo, logWebhookDetails } = require('./utils/webhookValidation');
const config = require('./config/deployment');

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Store tokens (in production, use a database)
let tokens = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null
};

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Zoho CRM to Google Drive Integration',
    status: 'running',
    endpoints: {
      auth: '/auth',
      callback: '/oauth/callback',
      status: '/status',
      test: '/test',
      webhook: '/zoho-webhook',
      health: '/health'
    }
  });
});

// Generate OAuth2 authorization URL (manual process)
app.get('/auth', (req, res) => {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const redirectUri = process.env.ZOHO_REDIRECT_URI || 'https://zoho.techlab.live/oauth/callback';
  
  if (!clientId) {
    return res.status(400).json({
      error: 'ZOHO_CLIENT_ID is not set in your .env file'
    });
  }
  
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?` +
    `scope=ZohoCRM.modules.ALL&` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}`;

  console.log('🔗 OAuth2 Authorization URL generated');
  console.log('=====================================');
  console.log(authUrl);
  console.log('=====================================');

  res.json({
    message: 'OAuth2 Authorization URL',
    authUrl: authUrl,
    instructions: [
      '📋 MANUAL STEPS:',
      '1. Copy the authUrl above',
      '2. Open it in your browser',
      '3. Authorize the application in Zoho',
      '4. You will be redirected to /oauth/callback',
      '5. Copy the refresh token from the response',
      '6. Add ZOHO_REFRESH_TOKEN to your .env file'
    ],
    nextSteps: [
      'After getting the refresh token, visit /test to verify it works',
      'Then configure your Zoho webhook to point to /zoho-webhook'
    ]
  });
});

// OAuth2 callback endpoint with dynamic accounts-server detection
app.get('/oauth/callback', async (req, res) => {
  const { code, error, 'accounts-server': accountsServer } = req.query;
  
  console.log('📥 OAuth callback received');
  console.log('Code:', code ? code.substring(0, 20) + '...' : 'None');
  console.log('Error:', error || 'None');
  console.log('Accounts Server:', accountsServer || 'None');
  
  if (error) {
    return res.status(400).json({
      error: 'OAuth authorization failed',
      details: error
    });
  }
  
  if (!code || !accountsServer) {
    return res.status(400).json({
      error: 'Missing authorization code or accounts-server',
      received: {
        code: !!code,
        accountsServer: !!accountsServer
      }
    });
  }

  try {
    console.log('🔄 Exchanging code for tokens...');
    console.log('Token Endpoint:', `${accountsServer}/oauth/v2/token`);
    
    // Use dynamic accounts-server for token exchange
    const tokenResponse = await axios.post(`${accountsServer}/oauth/v2/token`, 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: process.env.ZOHO_REDIRECT_URI || 'https://zoho.techlab.live/oauth/callback'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ Token exchange successful!');
    console.log('Response:', JSON.stringify(tokenResponse.data, null, 2));

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Store tokens
    tokens = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000)
    };

    // Update zohoAuth module with the new tokens
    const zohoAuth = require('./utils/zohoAuth');
    zohoAuth.setTokens(access_token, refresh_token, expires_in);
    zohoAuth.setAccountsServer(accountsServer);

    console.log('\n✅ Access Token:', access_token);
    console.log('🔁 Refresh Token:', refresh_token);
    console.log('⏳ Expires In:', expires_in, 'seconds');

    res.json({
      success: true,
      message: 'OAuth2 authorization completed successfully!',
      tokens: {
        accessToken: access_token ? '***RECEIVED***' : '***MISSING***',
        refreshToken: refresh_token ? '***RECEIVED***' : '***MISSING***',
        expiresIn: expires_in
      },
      envConfig: {
        ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID,
        ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET ? '***SET***' : '***MISSING***',
        ZOHO_REFRESH_TOKEN: refresh_token,
        ZOHO_REDIRECT_URI: process.env.ZOHO_REDIRECT_URI || 'https://zoho.techlab.live/oauth/callback'
      },
      instructions: [
        'Copy the ZOHO_REFRESH_TOKEN to your .env file',
        'Use /test to verify the tokens work',
        'Use /status to check token status'
      ]
    });

  } catch (error) {
    console.error('❌ Token exchange failed:', error.response?.data || error.message);
    
    res.status(500).json({
      error: 'Token exchange failed',
      details: error.response?.data || error.message,
      suggestions: [
        'Check your ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET',
        'Verify the redirect URI in your Zoho app',
        'Make sure your Zoho app is active',
        'Try getting a fresh authorization code'
      ]
    });
  }
});

// Check token status
app.get('/status', (req, res) => {
  res.json({
    hasTokens: !!(tokens.accessToken && tokens.refreshToken),
    isExpired: tokens.expiresAt ? Date.now() > tokens.expiresAt : null,
    expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt).toISOString() : null
  });
});

// Test the tokens
app.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing access token...');
    
    const zohoAuth = require('./utils/zohoAuth');
    const response = await zohoAuth.testConnection();

    res.json({
      success: true,
      message: 'Access token is valid!',
      organization: response.org?.[0]?.name || 'Unknown',
      response: response
    });

  } catch (error) {
    res.status(500).json({
      error: 'Token test failed',
      details: error.response?.data || error.message
    });
  }
});

// Zoho webhook endpoint
app.post('/zoho-webhook', async (req, res) => {
  try {
    console.log('Received webhook payload:', JSON.stringify(req.body, null, 2));
    
    // Validate webhook (optional - for security)
    if (!validateWebhook(req)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const { Deal_Name, Deal_ID, Stage, Amount, Created_Time } = req.body;
    
    if (!Deal_Name) {
      return res.status(400).json({ 
        error: 'Deal_Name is required in webhook payload' 
      });
    }

    console.log(`Processing deal: ${Deal_Name} (ID: ${Deal_ID}) created on ${Created_Time || 'unknown time'}`);

    // Create folder in Google Drive
    const folderId = await createGoogleDriveFolder(Deal_Name, {
      dealId: Deal_ID,
      stage: Stage,
      amount: Amount
    });

    const driveLink = `https://drive.google.com/drive/folders/${folderId}`;
    console.log(`Successfully created folder: ${driveLink}`);

    // Update the deal in Zoho CRM with the Drive link
    const zohoAuth = require('./utils/zohoAuth');
    const updateData = {
      id: Deal_ID,
      [config.GOOGLE_DRIVE_LINK_FIELD]: driveLink
    };

    try {
      // Update the custom field with Drive link
      await zohoAuth.updateDeal(Deal_ID, updateData);
      console.log(`Successfully updated deal ${Deal_ID} with Drive link`);
      
      // Append note about the folder creation
      if (config.APPEND_NOTES) {
        const noteContent = config.NOTE_TEMPLATE(driveLink, Deal_Name);
        await zohoAuth.appendDealNote(Deal_ID, noteContent);
        console.log(`Successfully appended note to deal ${Deal_ID}`);
      }
    } catch (updateError) {
      console.error('Warning: Failed to update deal in Zoho CRM:', updateError.message);
      // Continue with success response even if update fails
    }

    res.status(200).json({
      success: true,
      message: `Folder created and deal updated successfully for: ${Deal_Name}`,
      folderId: folderId,
      driveLink: driveLink,
      dealName: Deal_Name,
      dealId: Deal_ID,
      dealUpdated: true
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Zoho CRM to Google Drive Integration running on port ${PORT}`);
  console.log(`📱 Homepage: http://localhost:${PORT}`);
  console.log(`🔗 Auth URL: http://localhost:${PORT}/auth`);
  console.log(`📋 Status: http://localhost:${PORT}/status`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
  console.log(`🔔 Webhook: http://localhost:${PORT}/zoho-webhook`);
}); 