const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const { createGoogleDriveFolder } = require('./utils/googleDrive');
const { validateWebhook } = require('./utils/webhookValidation');
const config = require('./config/deployment');

const app = express();
const PORT = process.env.PORT || 3000;

// Token storage (in production, use a database)
let tokenStore = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Zoho CRM to Google Drive Integration',
    status: 'running',
    endpoints: {
      webhook: '/zoho-webhook',
      health: '/health',
      oauth: '/oauth/callback',
      authStatus: '/auth/status'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// OAuth callback endpoint for Zoho
app.get('/oauth/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    console.error('OAuth error:', error);
    return res.status(400).json({ 
      error: 'OAuth authorization failed', 
      details: error 
    });
  }
  
  if (!code) {
    return res.status(400).json({ 
      error: 'No authorization code received' 
    });
  }
  
  console.log('✅ OAuth callback received with code:', code);
  
  try {
    // Always use production redirect URI for production server
    const redirectUri = 'https://zoho.techlab.live/oauth/callback';
    
    console.log('🔄 Using redirect URI:', redirectUri);
    console.log('🔄 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔄 ZOHO_REDIRECT_URI:', process.env.ZOHO_REDIRECT_URI);
    
    // Exchange authorization code for tokens
    const requestData = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      redirect_uri: redirectUri,
      code: code
    });

    console.log('📤 Request Data:');
    console.log('grant_type:', 'authorization_code');
    console.log('client_id:', process.env.ZOHO_CLIENT_ID);
    console.log('client_secret:', process.env.ZOHO_CLIENT_SECRET ? '***SET***' : '***MISSING***');
    console.log('redirect_uri:', redirectUri);
    console.log('code:', code);
    console.log('');

    const tokenResponse = await axios.post('https://accounts.zoho.com/oauth/v2/token', 
      requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('📊 Token Response Status:', tokenResponse.status);
    console.log('📊 Token Response Data:', JSON.stringify(tokenResponse.data, null, 2));
    console.log('📊 Token Response Type:', typeof tokenResponse.data);
    console.log('📊 Token Response Keys:', Object.keys(tokenResponse.data));

    // Check if we got an error
    if (tokenResponse.data.error) {
      console.error('❌ Token exchange failed:', tokenResponse.data.error);
      console.error('❌ This usually means:');
      console.error('   - The redirect URI is not configured in your Zoho app');
      console.error('   - The authorization code has expired');
      console.error('   - The authorization code was already used');
      console.error('   - The client credentials are incorrect');
      
      return res.status(400).json({
        error: 'Token exchange failed',
        details: tokenResponse.data.error,
        suggestions: [
          'Check if https://zoho.techlab.live/oauth/callback is configured in your Zoho app',
          'Verify your client ID and client secret are correct',
          'Get a fresh authorization code (they expire quickly)',
          'Check that your Zoho app has the correct scopes configured'
        ]
      });
    }

    // Store tokens
    tokenStore = {
      accessToken: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token,
      expiresAt: Date.now() + (tokenResponse.data.expires_in * 1000)
    };

    console.log('✅ Tokens obtained and stored successfully');
    console.log('🔑 REFRESH TOKEN FOR .env FILE:', tokenResponse.data.refresh_token);
    console.log('⏰ Token expires in:', tokenResponse.data.expires_in, 'seconds');
    
    res.json({
      success: true,
      message: 'OAuth authorization completed successfully!',
      tokensReceived: true,
      expiresIn: tokenResponse.data.expires_in,
      refreshToken: tokenResponse.data.refresh_token, // Include in response for easy copying
      instructions: [
        'Tokens have been stored in memory',
        'Use /auth/status to check token status',
        'The refresh token is long-lived and will be used for future requests',
        'Copy the refresh token above to your .env file'
      ]
    });
    
  } catch (error) {
    console.error('❌ Error exchanging code for tokens:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to exchange authorization code for tokens',
      details: error.response?.data || error.message
    });
  }
});

// Auth status endpoint
app.get('/auth/status', (req, res) => {
  const hasTokens = !!(tokenStore.accessToken && tokenStore.refreshToken);
  const isExpired = tokenStore.expiresAt && Date.now() > tokenStore.expiresAt;
  
  res.json({
    hasTokens,
    isExpired,
    expiresAt: tokenStore.expiresAt ? new Date(tokenStore.expiresAt).toISOString() : null,
    hasRefreshToken: !!tokenStore.refreshToken
  });
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

    // Check if deal was created after deployment date
    const deploymentDate = new Date(config.DEPLOYMENT_DATE);
    const dealCreatedDate = Created_Time ? new Date(Created_Time) : new Date();
    
    if (dealCreatedDate < deploymentDate) {
      console.log(`Skipping deal ${Deal_ID} - created before deployment date (${config.DEPLOYMENT_DATE})`);
      return res.status(200).json({
        success: true,
        message: `Deal ${Deal_ID} skipped - created before deployment date`,
        skipped: true,
        dealId: Deal_ID,
        deploymentDate: config.DEPLOYMENT_DATE
      });
    }

    console.log(`Processing deal: ${Deal_Name} (ID: ${Deal_ID}) created on ${dealCreatedDate}`);

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Homepage: https://zoho.techlab.live/`);
  console.log(`🔗 Webhook endpoint: https://zoho.techlab.live/zoho-webhook`);
  console.log(`💚 Health check: https://zoho.techlab.live/health`);
}); 