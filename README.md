# Zoho CRM to Google Drive Integration

Automatically create Google Drive folders for new Zoho CRM deals and update the deal with the Drive link.

## 🚀 Features

- **OAuth2 Authentication**: Secure Zoho CRM API access
- **Webhook Processing**: Real-time deal creation notifications
- **Google Drive Integration**: Automatic folder creation
- **Deal Updates**: Update Zoho deals with Drive links
- **Custom Fields**: Use custom fields for Drive links
- **Note Appending**: Add notes about folder creation

## 📋 Prerequisites

- Node.js (v14 or higher)
- Zoho CRM account
- Google Cloud project with Drive API enabled
- Google Service Account credentials
- Domain with HTTPS (for webhooks)

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp env.example .env
```

Required environment variables:
- `ZOHO_CLIENT_ID` - Your Zoho OAuth2 app client ID
- `ZOHO_CLIENT_SECRET` - Your Zoho OAuth2 app client secret
- `ZOHO_REDIRECT_URI` - OAuth2 redirect URI (e.g., `https://yourdomain.com/oauth/callback`)
- `ZOHO_REFRESH_TOKEN` - OAuth2 refresh token (optional - will be obtained automatically)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google service account email
- `GOOGLE_PRIVATE_KEY` - Google service account private key
- `GOOGLE_DRIVE_PARENT_FOLDER_ID` - Google Drive parent folder ID
- `WEBHOOK_SECRET` - Secret for webhook validation
- `PORT` - Server port (default: 3010)

### 3. Start the Server
```bash
npm start
```

### 4. Complete OAuth2 Setup
Visit `http://localhost:3010/auth` to get the authorization URL, then:

1. Copy the authorization URL
2. Open it in your browser
3. Authorize the application in Zoho
4. **Tokens are automatically stored in memory** ✅
5. **No need to manually add to .env file** ✅
6. **System refreshes tokens automatically** ✅

### 5. Test the Setup
```bash
npm test
```

## 📜 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Test OAuth2 connection and API access
- `npm run test:webhook` - Test webhook processing
- `npm run test:deal-update` - Test complete end-to-end flow
- `npm run check-env` - Check environment variable setup
- `npm run get-auth-url` - Generate OAuth2 authorization URL

## 🌐 API Endpoints

- `GET /` - Homepage with endpoint information
- `GET /auth` - Generate OAuth2 authorization URL
- `GET /oauth/callback` - OAuth2 callback endpoint
- `GET /status` - Check token status
- `GET /test` - Test API connection
- `POST /zoho-webhook` - Zoho webhook endpoint
- `GET /health` - Health check

## 🔐 OAuth2 Flow

### Manual Process (Recommended for Servers)

1. **Get Authorization URL**: Visit `/auth` endpoint
2. **Authorize**: Open the URL in your browser
3. **Get Refresh Token**: Copy from callback response
4. **Configure**: Add refresh token to `.env` file

### Token Management

- **Access Token**: Short-lived (1 hour), auto-refreshed
- **Refresh Token**: Long-lived, used to get new access tokens
- **Auto Refresh**: Handled automatically by the system

## 🔧 Setup Instructions

### Google Drive Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Drive API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in details and create

4. **Generate JSON Key**
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose JSON format
   - Download the file

5. **Extract Credentials**
   - Open the JSON file
   - Copy `client_email` to `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Copy `private_key` to `GOOGLE_PRIVATE_KEY`
   - Create a folder in Google Drive and copy its ID to `GOOGLE_DRIVE_PARENT_FOLDER_ID`

### Zoho CRM Setup

1. **Create OAuth2 App**
   - Go to [Zoho Developer Console](https://api-console.zoho.com/)
   - Click "Add Client"
   - Choose "Self-Client" or "Web-based"
   - Set redirect URI to your callback URL
   - Note down Client ID and Client Secret

2. **Create Custom Field**
   - Go to Zoho CRM Setup
   - Navigate to "Customization" > "Modules and Fields" > "Fields"
   - Create a new field for "Google Drive Link"
   - Note the field name (e.g., `Google_Drive_Link`)

3. **Configure Webhook**
   - Go to Zoho CRM Setup
   - Navigate to "Developer Space" > "Webhooks"
   - Create new webhook for "Deals" module
   - Set URL to your webhook endpoint
   - Choose "Create" event
   - Add webhook secret to `WEBHOOK_SECRET`

## 🧪 Testing

### Test OAuth2 Connection
```bash
npm test
```

### Test Webhook Processing
```bash
npm run test:webhook
```

### Test Complete Flow
```bash
npm run test:deal-update
```

## 🔍 Troubleshooting

### Common Issues

1. **"invalid_code" Error**
   - Check redirect URI matches exactly
   - Ensure authorization code is used immediately
   - Verify client ID and secret are correct

2. **"invalid oauth token" Error**
   - Refresh token may be expired
   - Complete OAuth2 flow again
   - Check token format in `.env`

3. **Webhook Not Receiving Data**
   - Verify webhook URL is accessible
   - Check webhook is active in Zoho
   - Ensure HTTPS is enabled

4. **Google Drive Permission Errors**
   - Verify service account has access to parent folder
   - Check Drive API is enabled
   - Ensure private key is correctly formatted

### Debug Commands

```bash
# Check environment variables
npm run check-env

# Test OAuth2 flow
npm test

# Test webhook endpoint
curl -X POST http://localhost:3010/zoho-webhook \
  -H "Content-Type: application/json" \
  -d '{"Deal_Name":"Test Deal","Deal_ID":"123"}'
```

## 🔒 Security Best Practices

- Use HTTPS in production
- Store sensitive data in environment variables
- Regularly rotate refresh tokens
- Validate webhook signatures
- Use service accounts for Google Drive
- Implement rate limiting
- Monitor webhook logs

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure HTTPS
- [ ] Set up environment variables
- [ ] Complete OAuth2 flow
- [ ] Test webhook endpoint
- [ ] Configure Zoho webhook
- [ ] Set up monitoring
- [ ] Configure backup strategy

### Quick Commands

```bash
# Deploy to server
git push origin main

# Install dependencies
npm install --production

# Start server
npm start

# Check logs
tail -f logs/app.log
```

## 📁 Project Structure

```
zoho-to-gdrive/
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
├── .env.example            # Environment variables template
├── README.md               # This file
├── config/
│   └── deployment.js       # Configuration settings
├── utils/
│   ├── googleDrive.js      # Google Drive operations
│   ├── webhookValidation.js # Webhook validation
│   └── zohoAuth.js         # Zoho API authentication
├── scripts/
│   └── check-env.js        # Environment validation
└── test-*.js              # Test scripts
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error details
3. Test individual components
4. Verify environment configuration

## 📄 License

MIT License - see LICENSE file for details. 