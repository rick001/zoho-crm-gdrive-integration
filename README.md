# Zoho CRM to Google Drive Integration

This Node.js application creates a seamless integration between Zoho CRM and Google Drive. Whenever a new deal is created in Zoho CRM, a corresponding folder is automatically created in Google Drive.

## Features

- ✅ **Webhook Integration**: Receives deal creation events from Zoho CRM
- ✅ **Google Drive Integration**: Creates folders using Google Drive API
- ✅ **OAuth2 Authentication**: Secure authentication with both Zoho and Google
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Security**: Webhook validation and secure token management
- ✅ **Monitoring**: Health check endpoints and detailed logging

## Prerequisites

Before setting up this integration, you'll need:

1. **Zoho CRM Account** with API access
2. **Google Cloud Project** with Drive API enabled
3. **Service Account** for Google Drive API
4. **Domain/Server** to host the webhook endpoint

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd zoho-crm-gdrive-integration
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Zoho CRM Configuration
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
ZOHO_REDIRECT_URI=https://zoho.techlab.live/oauth/callback

# Google Drive Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_PARENT_FOLDER_ID=your_parent_folder_id

# Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret
```

### 3. Google Drive Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Drive API

2. **Create a Service Account**:
   - Go to "IAM & Admin" > "Service Accounts"
   - Create a new service account
   - Download the JSON key file
   - Extract the `client_email` and `private_key` for your `.env` file

3. **Set up Google Drive**:
   - Create a parent folder in Google Drive where deal folders will be created
   - Share the folder with your service account email (with Editor permissions)
   - Copy the folder ID from the URL and add it to `GOOGLE_DRIVE_PARENT_FOLDER_ID`

### 4. Zoho CRM Setup

#### 4.1 Create Zoho App
1. **Go to Zoho Developer Console**:
   - Visit [Zoho API Console](https://api-console.zoho.com/)
   - Sign in with your Zoho account

2. **Create a New Client**:
   - Click "Add Client"
   - Choose "Server-based Applications"
   - Fill in the details:
     - **Client Name**: `Zoho CRM to Google Drive Integration`
     - **Homepage URL**: `https://zoho.techlab.live/`
     - **Authorized Redirect URIs**: `https://zoho.techlab.live/oauth/callback`

3. **Get Your Credentials**:
   - Copy the **Client ID** and **Client Secret**
   - Add them to your `.env` file

#### 4.2 Get Refresh Token (Automated Method)

1. **Set up your credentials** in `.env`:
   ```env
   ZOHO_CLIENT_ID=your_client_id_here
   ZOHO_CLIENT_SECRET=your_client_secret_here
   ZOHO_REDIRECT_URI=https://zoho.techlab.live/oauth/callback
   ```

2. **Start the server** (for callback handling):
   ```bash
   npm run dev
   ```

3. **Run the automated token generator**:
   ```bash
   npm run get-token
   ```

4. **Follow the prompts**:
   - Copy the authorization URL from the script
   - Open it in your browser
   - Authorize the application
   - Copy the authorization code from the redirect URL
   - Paste it back into the script
   - The script will give you the refresh token

5. **Add the refresh token** to your `.env` file

#### 4.3 Manual OAuth2 Flow (Alternative)

If you prefer manual setup, see [ZOHO_SETUP.md](ZOHO_SETUP.md) for detailed instructions.

#### 4.4 Set up Webhook (Optional)
- In Zoho CRM, go to Setup > Developer Space > Webhooks
- Create a webhook for Deal creation events
- Set the webhook URL to: `https://zoho.techlab.live/zoho-webhook`

### 5. Deploy the Application

#### Local Development

```bash
npm run dev
```

#### Production Deployment

```bash
npm start
```

The server will be available at:
- **Homepage**: https://zoho.techlab.live/
- **Webhook Endpoint**: https://zoho.techlab.live/zoho-webhook
- **Health Check**: https://zoho.techlab.live/health

## API Endpoints

### GET /
Returns basic information about the integration.

### GET /health
Health check endpoint for monitoring.

### GET /oauth/callback
OAuth2 callback endpoint for Zoho authorization.
- Receives authorization codes from Zoho
- Displays the code for manual token exchange
- Used by the automated token generator

### POST /zoho-webhook
Receives webhook events from Zoho CRM.

**Expected Payload**:
```json
{
  "Deal_Name": "Sample Deal",
  "Deal_ID": "123456789",
  "Stage": "Qualification",
  "Amount": "50000"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Folder created successfully for deal: Sample Deal",
  "folderId": "1ABC...",
  "dealName": "Sample Deal",
  "dealId": "123456789"
}
```

## Testing the Integration

### 1. Test Zoho Authentication

```bash
# Start the server
npm run dev

# In another terminal, run the token generator
npm run get-token
```

### 2. Test Webhook Endpoint

```bash
# Test locally
curl -X POST http://localhost:3000/zoho-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "Deal_Name": "Test Deal",
    "Deal_ID": "123456789",
    "Stage": "Qualification",
    "Amount": "50000"
  }'

# Test production (after deployment)
curl -X POST https://zoho.techlab.live/zoho-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "Deal_Name": "Test Deal",
    "Deal_ID": "123456789",
    "Stage": "Qualification",
    "Amount": "50000"
  }'
```

### 3. Test Google Drive Integration

The application will automatically create a folder in Google Drive when a webhook is received.

### 4. Run Automated Tests

```bash
npm test
```

### 5. Monitor Logs

Check the console output for detailed logs about:
- Webhook reception
- Google Drive folder creation
- Error messages

## File Structure

```
zoho-to-gdrive/
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── env.example           # Environment variables template
├── README.md             # This file
├── ZOHO_SETUP.md         # Detailed Zoho OAuth2 setup guide
├── DEPLOYMENT.md          # Deployment guide for various platforms
├── get-zoho-token.js     # Automated OAuth2 token generator
├── test-webhook.js       # Test script for webhook functionality
└── utils/
    ├── googleDrive.js    # Google Drive API utilities
    ├── zohoAuth.js       # Zoho OAuth2 utilities
    └── webhookValidation.js # Webhook security utilities
```

## Troubleshooting

### Common Issues

1. **Google Drive API Errors**:
   - Ensure the service account has proper permissions
   - Check that the parent folder ID is correct
   - Verify the private key format in `.env`

2. **Zoho Authentication Errors**:
   - Verify your client ID and secret
   - Check that the refresh token is valid
   - Ensure the redirect URI matches exactly
   - Use `npm run get-token` to regenerate tokens if needed

3. **Webhook Not Receiving Data**:
   - Check that the webhook URL is accessible
   - Verify the webhook is properly configured in Zoho CRM
   - Check server logs for incoming requests

4. **OAuth2 Authorization Issues**:
   - Ensure redirect URI matches exactly in Zoho console
   - Check that authorization code hasn't expired (10 minutes)
   - Verify all required scopes are requested

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

### Quick Token Refresh

If your refresh token expires, regenerate it:
```bash
npm run get-token
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Webhook Validation**: Implement proper signature validation in production
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Consider implementing rate limiting for the webhook endpoint
5. **Token Security**: Store tokens securely and rotate them regularly
6. **OAuth2 Security**: Keep refresh tokens secure and regenerate if compromised

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Check [ZOHO_SETUP.md](ZOHO_SETUP.md) for detailed OAuth2 setup
4. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions
5. Create an issue in the repository

## Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your credentials

# Get Zoho refresh token (automated)
npm run get-token

# Start development server
npm run dev

# Test the integration
npm test
```

---

**Note**: This integration requires both Zoho CRM and Google Drive accounts with proper API access. Make sure you have the necessary permissions and API quotas for your use case. 