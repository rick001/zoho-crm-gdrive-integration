# Zoho OAuth2 Setup Guide

This guide will help you set up the OAuth2 authentication flow for integrating with Zoho CRM API.

## Prerequisites

1. **Zoho Developer Account**: You need a Zoho Developer account to create OAuth2 applications
2. **Domain**: Your server must be accessible via HTTPS (e.g., `https://zoho.techlab.live`)
3. **Environment Variables**: Set up your `.env` file with the required credentials

## Step 1: Create Zoho OAuth2 Application

1. Go to [Zoho Developer Console](https://api-console.zoho.com/)
2. Click "Add Client"
3. Choose "Self-Client" for server-to-server communication
4. Fill in the details:
   - **Client Name**: `Zoho CRM to Google Drive Integration`
   - **Homepage URL**: `https://zoho.techlab.live`
   - **Authorized Redirect URIs**: `https://zoho.techlab.live/oauth/callback`
   - **Scope**: `ZohoCRM.modules.ALL,ZohoCRM.settings.ALL`

5. Save the application and note down:
   - **Client ID**
   - **Client Secret**

## Step 2: Configure Environment Variables

Create a `.env` file in your project root with:

```env
# Zoho CRM Configuration
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_REDIRECT_URI=https://zoho.techlab.live/oauth/callback

# Other required variables...
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_PARENT_FOLDER_ID=your_parent_folder_id
WEBHOOK_SECRET=your_webhook_secret
DEPLOYMENT_DATE=2025-08-01T00:00:00Z
```

## Step 3: OAuth2 Authorization Flow

### Option A: Automated Setup (Recommended)

1. **Deploy your server** to your domain (e.g., `https://zoho.techlab.live`)
2. **Run the setup script**:
   ```bash
   npm run setup-oauth
   ```
3. **Follow the prompts** to complete the OAuth2 flow
4. **Copy the refresh token** to your `.env` file

### Option B: Manual Setup

1. **Generate the authorization URL**:
   ```
   https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=https://zoho.techlab.live/oauth/callback
   ```

2. **Open the URL** in your browser and authorize the application

3. **Copy the authorization code** from the redirect URL:
   ```
   https://zoho.techlab.live/oauth/callback?code=AUTH_CODE
   ```

4. **Exchange the code for tokens** using the setup script or manually:
   ```bash
   npm run setup-oauth
   ```

## Step 4: Verify Setup

1. **Check token status**:
   ```bash
   curl https://zoho.techlab.live/auth/status
   ```

2. **Test the webhook**:
   ```bash
   npm run test:webhook
   ```

## OAuth2 Flow Details

### Authorization Request
```
GET https://accounts.zoho.com/oauth/v2/auth
  ?scope=ZohoCRM.modules.ALL
  &client_id=YOUR_CLIENT_ID
  &response_type=code
  &access_type=offline
  &redirect_uri=https://zoho.techlab.live/oauth/callback
```

### Token Exchange
```
POST https://accounts.zoho.com/oauth/v2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&redirect_uri=https://zoho.techlab.live/oauth/callback
&code=AUTH_CODE
```

### Token Refresh
```
POST https://accounts.zoho.com/oauth/v2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&refresh_token=YOUR_REFRESH_TOKEN
```

### API Requests
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

## Security Best Practices

1. **Store refresh tokens securely** - never commit them to version control
2. **Use environment variables** for all sensitive data
3. **Implement proper error handling** for token refresh failures
4. **Monitor token expiration** and refresh proactively
5. **Use HTTPS** for all OAuth2 endpoints

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

### Debug Endpoints

- **Health Check**: `GET /health`
- **Auth Status**: `GET /auth/status`
- **OAuth Callback**: `GET /oauth/callback`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Homepage with endpoint list |
| `/health` | GET | Health check |
| `/auth/status` | GET | OAuth token status |
| `/oauth/callback` | GET | OAuth2 callback handler |
| `/zoho-webhook` | POST | Zoho webhook receiver |

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