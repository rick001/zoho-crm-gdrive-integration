# Deployment Guide

This guide covers deploying the Zoho CRM to Google Drive integration to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:

1. ✅ **Environment Variables**: All required environment variables configured
2. ✅ **Google Drive Setup**: Service account and parent folder configured
3. ✅ **Zoho CRM Setup**: OAuth2 credentials and refresh token
4. ✅ **Domain**: A domain pointing to your server (for webhook URLs)

## Local Development

### Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your credentials
# (See README.md for detailed setup)

# Start development server
npm run dev
```

### Testing

```bash
# Test the webhook endpoint
npm test
```

## Production Deployment

### Option 1: Railway

1. **Create Railway Account**:
   - Go to [Railway](https://railway.app/)
   - Sign up with GitHub

2. **Deploy from GitHub**:
   - Connect your GitHub repository
   - Railway will auto-detect Node.js

3. **Configure Environment Variables**:
   - Go to your project settings
   - Add all variables from `.env` file

4. **Deploy**:
   - Railway will automatically deploy on push

### Option 2: Render

1. **Create Render Account**:
   - Go to [Render](https://render.com/)
   - Sign up with GitHub

2. **Create Web Service**:
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`

3. **Configure Environment Variables**:
   - Add all variables from `.env` file

4. **Deploy**:
   - Render will automatically deploy

### Option 3: Heroku

1. **Install Heroku CLI**:
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**:
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set ZOHO_CLIENT_ID=your_client_id
   heroku config:set ZOHO_CLIENT_SECRET=your_client_secret
   heroku config:set ZOHO_REFRESH_TOKEN=your_refresh_token
   heroku config:set ZOHO_REDIRECT_URI=https://zoho.techlab.live/oauth/callback
   heroku config:set GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
   heroku config:set GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   heroku config:set GOOGLE_DRIVE_PARENT_FOLDER_ID=your_parent_folder_id
   heroku config:set WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Create DigitalOcean Account**:
   - Go to [DigitalOcean](https://www.digitalocean.com/)
   - Sign up and add payment method

2. **Create App**:
   - Go to App Platform
   - Connect your GitHub repository
   - Select Node.js environment

3. **Configure Environment**:
   - Set build command: `npm install`
   - Set run command: `npm start`
   - Add all environment variables

4. **Deploy**:
   - DigitalOcean will automatically deploy

### Option 5: VPS (Ubuntu/Debian)

1. **Server Setup**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Deploy Application**:
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd zoho-to-gdrive
   
   # Install dependencies
   npm install
   
   # Copy environment file
   cp env.example .env
   # Edit .env with your credentials
   
   # Start with PM2
   pm2 start server.js --name "zoho-gdrive"
   pm2 startup
   pm2 save
   ```

3. **Configure Nginx** (Optional):
   ```bash
   # Install Nginx
   sudo apt install nginx
   
   # Create Nginx config
   sudo nano /etc/nginx/sites-available/zoho-gdrive
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name zoho.techlab.live;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/zoho-gdrive /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Configure SSL** (Recommended):
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d zoho.techlab.live
   ```

## Environment Variables Checklist

Ensure these are set in your production environment:

- [ ] `PORT` (usually set by hosting platform)
- [ ] `NODE_ENV=production`
- [ ] `ZOHO_CLIENT_ID`
- [ ] `ZOHO_CLIENT_SECRET`
- [ ] `ZOHO_REFRESH_TOKEN`
- [ ] `ZOHO_REDIRECT_URI`
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- [ ] `GOOGLE_PRIVATE_KEY`
- [ ] `GOOGLE_DRIVE_PARENT_FOLDER_ID`
- [ ] `WEBHOOK_SECRET`

## Post-Deployment Checklist

After deployment, verify:

- [ ] **Health Check**: Visit `https://your-domain.com/health`
- [ ] **Homepage**: Visit `https://your-domain.com/`
- [ ] **Webhook Test**: Run the test script against your production URL
- [ ] **Zoho Webhook**: Update Zoho CRM webhook URL to your production domain
- [ ] **Google Drive**: Test folder creation manually
- [ ] **Logs**: Monitor application logs for errors

## Monitoring

### PM2 (VPS)
```bash
# View logs
pm2 logs zoho-gdrive

# Monitor processes
pm2 monit

# Restart application
pm2 restart zoho-gdrive
```

### Railway/Render/Heroku
- Use the platform's built-in logging dashboard
- Set up alerts for errors

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**:
   - Check all required variables are configured
   - Restart the application after setting variables

2. **Google Drive API Errors**:
   - Verify service account permissions
   - Check parent folder ID is correct
   - Ensure private key format is correct

3. **Zoho Authentication Errors**:
   - Verify client ID and secret
   - Check refresh token is valid
   - Ensure redirect URI matches exactly

4. **Webhook Not Working**:
   - Verify webhook URL is accessible
   - Check server logs for incoming requests
   - Test with curl or Postman

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Never commit `.env` files
3. **Rate Limiting**: Consider implementing rate limiting
4. **Webhook Validation**: Implement proper signature validation
5. **Token Rotation**: Regularly rotate access tokens

## Support

For deployment issues:
1. Check the hosting platform's documentation
2. Review application logs
3. Test locally first
4. Verify all environment variables are set correctly 