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
cd zoho-to-gdrive
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

1. **Create a Zoho App**:
   - Go to [Zoho Developer Console](https://api-console.zoho.com/)
   - Create a new client
   - Set the redirect URI to: `https://zoho.techlab.live/oauth/callback`
   - Note down the Client ID and Client Secret

2. **Get Refresh Token**:
   - Use the authorization URL to get an authorization code
   - Exchange the code for a refresh token
   - Add the refresh token to your `.env` file

3. **Set up Webhook** (Optional):
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

### 1. Test Webhook Endpoint

```bash
curl -X POST https://zoho.techlab.live/zoho-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "Deal_Name": "Test Deal",
    "Deal_ID": "123456789",
    "Stage": "Qualification",
    "Amount": "50000"
  }'
```

### 2. Test Google Drive Integration

The application will automatically create a folder in Google Drive when a webhook is received.

### 3. Monitor Logs

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

3. **Webhook Not Receiving Data**:
   - Check that the webhook URL is accessible
   - Verify the webhook is properly configured in Zoho CRM
   - Check server logs for incoming requests

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Webhook Validation**: Implement proper signature validation in production
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Consider implementing rate limiting for the webhook endpoint
5. **Token Security**: Store tokens securely and rotate them regularly

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
3. Create an issue in the repository

---

**Note**: This integration requires both Zoho CRM and Google Drive accounts with proper API access. Make sure you have the necessary permissions and API quotas for your use case. 