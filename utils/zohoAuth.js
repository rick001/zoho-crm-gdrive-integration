const axios = require('axios');
require('dotenv').config();

class ZohoAuth {
  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID;
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET;
    this.accessToken = null;
    this.expiresAt = null;
    this.accountsServer = null; // Will be set dynamically
    this.apiDomain = 'https://www.zohoapis.com'; // Default API domain
  }

  /**
   * Set tokens from server's token management
   */
  setTokens(accessToken, refreshToken, expiresIn, apiDomain = null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = Date.now() + (expiresIn * 1000);
    
    // Update API domain if provided
    if (apiDomain) {
      this.apiDomain = apiDomain;
      console.log('🔧 API domain set to:', apiDomain);
    }
    
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
      console.log('✅ Using existing access token (not expired)');
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
      console.log('Refresh Token:', this.refreshToken.substring(0, 20) + '...');
      
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

      console.log('✅ Token refresh response:', JSON.stringify(response.data, null, 2));

      this.accessToken = response.data.access_token;
      this.expiresAt = Date.now() + (response.data.expires_in * 1000);

      // Update API domain if provided in response
      if (response.data.api_domain) {
        this.apiDomain = response.data.api_domain;
        console.log('🔧 API domain updated to:', this.apiDomain);
      }

      console.log('✅ Access token refreshed successfully');
      console.log('🔧 Current API domain:', this.apiDomain);
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
    
    const url = `${this.apiDomain}/crm/v2/${endpoint}`;
    console.log(`🌐 Making ${method} request to: ${url}`);
    console.log(`🔧 Using API domain: ${this.apiDomain}`);
    console.log(`🔑 Access token: ${accessToken.substring(0, 20)}...`);
    
    const config = {
      method,
      url,
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
      console.log('📦 Request data:', JSON.stringify(data, null, 2));
    }

    try {
      console.log('🚀 Sending request...');
      const response = await axios(config);
      console.log('✅ API request successful');
      return response.data;
    } catch (error) {
      console.error(`❌ Zoho API request failed (${method} ${endpoint}):`, error.response?.data || error.message);
      console.error('🔍 Full error details:', error.response?.status, error.response?.statusText);
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
      // Try to get deals instead of org, as it's more likely to work with our scope
      const response = await this.makeRequest('GET', 'Deals?per_page=1');
      console.log('✅ Zoho CRM connection test successful');
      return {
        success: true,
        message: 'Connection successful',
        deals: response.data || [],
        total: response.info?.count || 0
      };
    } catch (error) {
      console.error('❌ Zoho CRM connection test failed:', error.message);
      throw error;
    }
  }
}

module.exports = new ZohoAuth(); 