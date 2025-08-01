# Zoho OAuth2 Setup Guide

This guide will help you obtain the refresh token needed for the Zoho CRM integration.

## Prerequisites

1. ✅ **Zoho Developer Account**: You need a Zoho account
2. ✅ **Zoho CRM Access**: Your account should have CRM access
3. ✅ **Domain**: A domain for the redirect URI (or use localhost for testing)

## Step 1: Create Zoho App

### 1.1 Go to Zoho Developer Console
- Visit [Zoho API Console](https://api-console.zoho.com/)
- Sign in with your Zoho account

### 1.2 Create a New Client
- Click "Add Client"
- Choose "Server-based Applications"
- Fill in the details:
  - **Client Name**: `Zoho CRM to Google Drive Integration`
  - **Homepage URL**: `https://zoho.techlab.live/`
  - **Authorized Redirect URIs**: `https://zoho.techlab.live/oauth/callback`

### 1.3 Get Your Credentials
After creating the client, you'll get:
- ✅ **Client ID** (e.g., `1000.ABC123...`)
- ✅ **Client Secret** (e.g., `abc123def456...`)

## Step 2: Set Up Environment Variables

Create a `.env` file with your credentials:

```bash
cp env.example .env
```

Edit `.env` and add your Zoho credentials:

```env
# Zoho CRM Configuration
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_REDIRECT_URI=https://zoho.techlab.live/oauth/callback
```

## Step 3: Get Refresh Token

### Option A: Using the Automated Script (Recommended)

1. **Start the server** (for callback handling):
   ```bash
   npm run dev
   ```

2. **Run the token generator**:
   ```bash
   npm run get-token
   ```

3. **Follow the prompts**:
   - The script will show you an authorization URL
   - Open the URL in your browser
   - Authorize the application
   - Copy the authorization code from the redirect URL
   - Paste it back into the script

4. **Get your tokens**:
   - The script will exchange the code for tokens
   - It will display your refresh token
   - Copy the refresh token to your `.env` file

### Option B: Manual OAuth2 Flow

1. **Generate Authorization URL**:
   ```
   https://accounts.zoho.com/oauth/v2/auth?
   response_type=code&
   client_id=YOUR_CLIENT_ID&
   scope=ZohoCRM.modules.ALL,ZohoCRM.settings.ALL&
   redirect_uri=https://zoho.techlab.live/oauth/callback&
   access_type=offline&
   prompt=consent
   ```

2. **Authorize the Application**:
   - Open the URL in your browser
   - Sign in to Zoho
   - Grant permissions to your app
   - You'll be redirected with an authorization code

3. **Exchange Code for Tokens**:
   ```bash
   curl -X POST https://accounts.zoho.com/oauth/v2/token \
     -d "code=AUTHORIZATION_CODE" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "redirect_uri=https://zoho.techlab.live/oauth/callback" \
     -d "grant_type=authorization_code"
   ```

4. **Extract Refresh Token**:
   - From the response, copy the `refresh_token` value
   - Add it to your `.env` file

## Step 4: Complete Your .env File

After getting the refresh token, your `.env` should look like:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Zoho CRM Configuration
ZOHO_CLIENT_ID=1000.ABC123...
ZOHO_CLIENT_SECRET=abc123def456...
ZOHO_REFRESH_TOKEN=1000.xyz789...
ZOHO_REDIRECT_URI=https://zoho.techlab.live/oauth/callback

# Google Drive Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_PARENT_FOLDER_ID=your_parent_folder_id

# Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret
```

## Step 5: Test the Integration

1. **Test Zoho Authentication**:
   ```bash
   npm run dev
   ```

2. **Check the logs** for successful token refresh

3. **Test the webhook**:
   ```bash
   npm test
   ```

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**:
   - Make sure the redirect URI in your Zoho app matches exactly
   - Check for trailing slashes or protocol differences

2. **"Authorization code expired"**:
   - Authorization codes expire quickly (usually 10 minutes)
   - Generate a new authorization URL and try again

3. **"Invalid client credentials"**:
   - Double-check your Client ID and Client Secret
   - Make sure you copied them correctly from the Zoho console

4. **"Access denied"**:
   - Ensure your Zoho account has CRM access
   - Check that you granted the necessary permissions

### Debug Mode

Enable detailed logging:
```bash
NODE_ENV=development npm run dev
```

### Manual Testing

Test your refresh token manually:
```bash
curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=refresh_token"
```

## Security Notes

1. **Keep Tokens Secure**: Never commit your `.env` file to version control
2. **Token Expiration**: Refresh tokens can expire, so monitor for errors
3. **Scope Permissions**: Only request the permissions you actually need
4. **HTTPS Required**: Always use HTTPS in production for the redirect URI

## Next Steps

Once you have your refresh token:

1. ✅ **Test the integration locally**
2. ✅ **Deploy to your hosting platform**
3. ✅ **Set up Zoho webhooks** (optional)
4. ✅ **Monitor the application logs**

---

**Need Help?** Check the main README.md for more detailed setup instructions or troubleshooting tips. 