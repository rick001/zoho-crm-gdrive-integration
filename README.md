# Zoho CRM to Google Drive Integration

This Node.js application creates a seamless integration between Zoho CRM and Google Drive. Whenever a new deal is created in Zoho CRM, a corresponding folder is automatically created in Google Drive.

## Features

- ✅ **OAuth2 Authentication**: Secure authentication with Zoho CRM API
- ✅ **Webhook Integration**: Receives deal creation events from Zoho CRM
- ✅ **Google Drive Integration**: Creates folders using Google Drive API
- ✅ **Automatic Token Refresh**: Handles OAuth2 token refresh automatically
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Security**: Webhook validation and secure token management
- ✅ **Monitoring**: Health check endpoints and detailed logging

## Prerequisites

Before setting up this integration, you'll need:

1. **Zoho CRM Account** with API access
2. **Google Cloud Project** with Drive API enabled
3. **Service Account** for Google Drive API
4. **Domain/Server** to host the webhook endpoint

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```env
# Zoho OAuth2 Configuration
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_REDIRECT_URI=https://zoho.techlab.live/oauth/callback
ZOHO_REFRESH_TOKEN=your_refresh_token_here

# Google Drive Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_PARENT_FOLDER_ID=your_parent_folder_id

# Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret



# Server Configuration
PORT=3010
NODE_ENV=development
```

### 3. OAuth2 Setup

#### Option A: Automated Setup (Recommended)

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Visit the auth endpoint**:
   ```
   http://localhost:3010/auth
   ```
   (Browser will open automatically)

3. **Complete the OAuth2 flow** and copy the refresh token to your `.env` file

#### Option B: Manual Setup

1. **Generate the authorization URL**:
   ```
   https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&prompt=consent&redirect_uri=https://zoho.techlab.live/oauth/callback
   ```

2. **Open the URL** in your browser and authorize the application

3. **Copy the authorization code** from the redirect URL and complete the flow

### 4. Test the Setup

```bash
# Test OAuth2 connection
npm test

# Test webhook endpoint
npm run test:webhook

# Check environment variables
npm run check-env
```

### 5. Deploy and Run

```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start development server with auto-restart |
| `npm test` | Test OAuth2 connection and API access |
| `npm run test:webhook` | Test webhook endpoint |
| `npm run test:deal-update` | Test complete flow (webhook → Drive folder → deal update) |
| `npm run check-env` | Validate environment variables |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Homepage with endpoint list |
| `/health` | GET | Health check |
| `/auth` | GET | Generate OAuth2 authorization URL |
| `/oauth/callback` | GET | OAuth2 callback handler |
| `/status` | GET | OAuth token status |
| `/test` | GET | Test access token |
| `/zoho-webhook` | POST | Zoho webhook receiver |

## OAuth2 Flow Details

### Authorization Request
```
GET https://accounts.zoho.com/oauth/v2/auth
  ?scope=ZohoCRM.modules.ALL
  &client_id=YOUR_CLIENT_ID
  &response_type=code
  &access_type=offline
  &prompt=consent
  &redirect_uri=https://zoho.techlab.live/oauth/callback
```

### Token Exchange
```
POST https://accounts.zoho.in/oauth/v2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&redirect_uri=https://zoho.techlab.live/oauth/callback
&code=AUTH_CODE
```

### Token Refresh
```
POST https://accounts.zoho.in/oauth/v2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&refresh_token=YOUR_REFRESH_TOKEN
```

### Deal Update API
```
PUT https://www.zohoapis.com/crm/v2/Deals/{deal_id}
Authorization: Zoho-oauthtoken ACCESS_TOKEN
Content-Type: application/json

{
  "data": [{
    "id": "deal_id",
    "Google_Drive_Link": "https://drive.google.com/drive/folders/folder_id"
  }]
}
```

## Detailed Setup Instructions

### Google Drive Setup

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

### Zoho CRM Setup

#### Create Zoho App
1. **Go to Zoho Developer Console**:
   - Visit [Zoho API Console](https://api-console.zoho.com/)
   - Sign in with your Zoho account

2. **Create a New Client**:
   - Click "Add Client"
   - Choose "OAuth2 App" for webhook integration
   - Fill in the details:
     - **Client Name**: `Zoho CRM to Google Drive Integration`
     - **Homepage URL**: `https://zoho.techlab.live`
     - **Authorized Redirect URIs**: `https://zoho.techlab.live/oauth/callback`
     - **Scope**: `ZohoCRM.modules.ALL,ZohoCRM.settings.ALL`

3. **Get Your Credentials**:
   - Copy the **Client ID** and **Client Secret**
   - Add them to your `.env` file

#### Set up Custom Field
1. **Create Custom Field in Zoho CRM**:
   - Go to Setup > Customization > Modules > Deals
   - Add a new custom field:
     - **Field Name**: `Google_Drive_Link`
     - **Data Type**: URL
     - **Field Label**: `Google Drive Link`

#### Configure Webhook
1. **Set up Webhook in Zoho CRM**:
   - Go to Setup > Developer Space > Webhooks
   - Create a new webhook:
     - **URL**: `https://zoho.techlab.live/zoho-webhook`
     - **Module**: Deals
     - **Events**: Create
     - **Condition**: Deal Stage = "Qualification" (or your preferred stage)

## Project Structure

```
zoho-to-gdrive/
├── server.js              # Main server with OAuth2 and webhook endpoints
├── utils/
│   ├── zohoAuth.js       # Zoho API authentication utilities
│   ├── googleDrive.js    # Google Drive API utilities
│   └── webhookValidation.js # Webhook validation utilities
├── config/
│   └── deployment.js     # Deployment configuration
├── scripts/
│   └── check-env.js      # Environment variable checker
├── test-improved-oauth.js # OAuth2 flow test script
├── test-webhook.js       # Webhook test script
├── package.json
├── README.md
└── .env                   # Environment variables (create this)
```

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Ensure the redirect URI in your Zoho app matches exactly
   - Check for trailing slashes or protocol mismatches

2. **"Invalid authorization code"**
   - Authorization codes expire quickly (usually 10 minutes)
   - Generate a new authorization code

3. **"Invalid refresh token"**
   - Refresh tokens can expire if not used for extended periods
   - Re-run the OAuth2 flow to get a new refresh token

4. **"Insufficient scope"**
   - Ensure your Zoho app has the correct scopes
   - Add `ZohoCRM.modules.ALL` and `ZohoCRM.settings.ALL`

### Debug Commands

```bash
# Check environment variables
npm run check-env

# Test OAuth2 connection
npm test

# Test webhook endpoint
npm run test:webhook

# Check server health
curl http://localhost:3010/health

# Check auth status
curl http://localhost:3010/status
```

## Security Best Practices

1. **Store refresh tokens securely** - never commit them to version control
2. **Use environment variables** for all sensitive data
3. **Implement proper error handling** for token refresh failures
4. **Monitor token expiration** and refresh proactively
5. **Use HTTPS** for all OAuth2 endpoints
6. **Validate webhook signatures** in production

## Deployment Checklist

- [ ] Set up HTTPS domain
- [ ] Configure environment variables
- [ ] Complete OAuth2 authorization
- [ ] Test webhook endpoint
- [ ] Verify Google Drive integration
- [ ] Set up Zoho webhook in CRM
- [ ] Test end-to-end flow

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the OAuth2 flow manually
4. Ensure your Zoho app has the correct permissions
5. Verify Google Drive API is enabled and service account has proper permissions 