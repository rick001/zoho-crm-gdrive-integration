const axios = require('axios');
require('dotenv').config();

class ZohoAuth {
  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID;
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET;
    this.accessToken = null;
    this.expiresAt = null;
    this.accountsServer = null; // Will be set dynamically
  }

  /**
   * Set tokens from server's token management
   */
  setTokens(accessToken, refreshToken, expiresIn) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = Date.now() + (expiresIn * 1000);
    console.log('🔧 Tokens set from server memory');
  }

  /**
   * Set the accounts server based on the refresh token origin
   */
  setAccountsServer(accountsServer) {
    this.accountsServer = accountsServer;
    console.log('🔧 Accounts server set to:', accountsServer);
  }

  /**
   * Get a valid access token (refresh if needed)
   */
  async getAccessToken() {
    // If we have a valid access token, return it
    if (this.accessToken && this.expiresAt && Date.now() < this.expiresAt) {
      return this.accessToken;
    }

    // If no refresh token, try to get from environment
    if (!this.refreshToken) {
      this.refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available. Please complete OAuth2 setup first.');
    }

    // Determine accounts server if not set
    if (!this.accountsServer) {
      // Try to detect from refresh token format or use default
      this.accountsServer = 'https://accounts.zoho.in';
      console.log('🔧 Using default accounts server:', this.accountsServer);
    }

    try {
      console.log('🔄 Refreshing access token...');
      console.log('Token Endpoint:', `${this.accountsServer}/oauth/v2/token`);
      
      const response = await axios.post(`${this.accountsServer}/oauth/v2/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.expiresAt = Date.now() + (response.data.expires_in * 1000);

      console.log('✅ Access token refreshed successfully');
      return this.accessToken;

    } catch (error) {
      console.error('❌ Failed to refresh access token:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token. Please check your refresh token.');
    }
  }

  /**
   * Make an authenticated request to Zoho CRM API
   */
  async makeRequest(method, endpoint, data = null) {
    const accessToken = await this.getAccessToken();
    
    const config = {
      method,
      url: `https://www.zohoapis.com/crm/v2/${endpoint}`,
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`❌ Zoho API request failed (${method} ${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update a deal in Zoho CRM
   */
  async updateDeal(dealId, updateData) {
    console.log(`🔄 Updating deal ${dealId}:`, updateData);
    
    const data = {
      data: [{
        id: dealId,
        ...updateData
      }]
    };

    return await this.makeRequest('PUT', `Deals/${dealId}`, data);
  }

  /**
   * Get a deal from Zoho CRM
   */
  async getDeal(dealId) {
    return await this.makeRequest('GET', `Deals/${dealId}`);
  }

  /**
   * Append a note to a deal
   */
  async appendDealNote(dealId, noteContent) {
    console.log(`📝 Appending note to deal ${dealId}:`, noteContent.substring(0, 50) + '...');
    
    const data = {
      data: [{
        Parent_Id: dealId,
        Note_Content: noteContent,
        Note_Title: 'Google Drive Integration'
      }]
    };

    return await this.makeRequest('POST', 'Notes', data);
  }

  /**
   * Test the connection to Zoho CRM
   */
  async testConnection() {
    try {
      const response = await this.makeRequest('GET', 'org');
      console.log('✅ Zoho CRM connection test successful');
      return response;
    } catch (error) {
      console.error('❌ Zoho CRM connection test failed:', error.message);
      throw error;
    }
  }
}

module.exports = new ZohoAuth(); 