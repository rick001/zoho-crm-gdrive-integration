require('dotenv').config();
const axios = require('axios');

// Replace this with the ?code=... you get after logging in via the Zoho auth URL
const authorizationCode = 'PASTE_AUTH_CODE_HERE';

async function getRefreshToken() {
  const {
    ZOHO_CLIENT_ID,
    ZOHO_CLIENT_SECRET,
    ZOHO_REDIRECT_URI
  } = process.env;

  const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    redirect_uri: ZOHO_REDIRECT_URI,
    code: authorizationCode,
  });

  try {
    const response = await axios.post(tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('✅ Access Token:', response.data.access_token);
    console.log('🔁 Refresh Token:', response.data.refresh_token);
    console.log('⏰ Expires in:', response.data.expires_in, 'seconds');

  } catch (error) {
    console.error('❌ Error fetching tokens:', error.response?.data || error.message);
  }
}

getRefreshToken();
