const axios = require('axios');

class ZohoAuth {
  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID;
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET;
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    this.redirectUri = process.env.ZOHO_REDIRECT_URI;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get access token using refresh token
   * @returns {Promise<string>} - Access token
   */
  async getAccessToken() {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('🔄 Refreshing Zoho access token...');
      
      const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', 
        new URLSearchParams({
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token'
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 1 hour from now (with 5 minute buffer)
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - (5 * 60 * 1000);

      console.log('✅ Zoho access token refreshed successfully');
      return this.accessToken;

    } catch (error) {
      console.error('❌ Error refreshing Zoho access token:', error.response?.data || error.message);
      throw new Error(`Failed to refresh Zoho access token: ${error.message}`);
    }
  }

  /**
   * Make authenticated request to Zoho CRM API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - API response
   */
  async makeRequest(endpoint, options = {}) {
    const accessToken = await this.getAccessToken();
    
    const config = {
      method: options.method || 'GET',
      url: `https://www.zohoapis.com/crm/v2/${endpoint}`,
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('❌ Zoho API request failed:', error.response?.data || error.message);
      throw new Error(`Zoho API request failed: ${error.message}`);
    }
  }

  /**
   * Get deal information from Zoho CRM
   * @param {string} dealId - Deal ID
   * @returns {Promise<Object>} - Deal information
   */
  async getDeal(dealId) {
    return this.makeRequest(`Deals/${dealId}`);
  }

  /**
   * Create a new deal in Zoho CRM
   * @param {Object} dealData - Deal data
   * @returns {Promise<Object>} - Created deal
   */
  async createDeal(dealData) {
    return this.makeRequest('Deals', {
      method: 'POST',
      data: { data: [dealData] }
    });
  }

  /**
   * Update a deal in Zoho CRM
   * @param {string} dealId - Deal ID
   * @param {Object} dealData - Updated deal data
   * @returns {Promise<Object>} - Updated deal
   */
  async updateDeal(dealId, dealData) {
    console.log(`🔄 Updating deal ${dealId} with data:`, dealData);
    
    return this.makeRequest(`Deals/${dealId}`, {
      method: 'PUT',
      data: { data: [dealData] }
    });
  }

  /**
   * Update deal notes by appending new note
   * @param {string} dealId - Deal ID
   * @param {string} noteContent - Note content to append
   * @returns {Promise<Object>} - Updated deal
   */
  async appendDealNote(dealId, noteContent) {
    // First get current deal to see existing notes
    const currentDeal = await this.getDeal(dealId);
    const existingNotes = currentDeal.data?.[0]?.Notes || '';
    
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n\n${noteContent}`
      : noteContent;

    return this.updateDeal(dealId, {
      id: dealId,
      Notes: updatedNotes
    });
  }

  /**
   * Search deals in Zoho CRM
   * @param {string} searchCriteria - Search criteria
   * @returns {Promise<Object>} - Search results
   */
  async searchDeals(searchCriteria) {
    return this.makeRequest('Deals/search', {
      method: 'POST',
      data: { criteria: searchCriteria }
    });
  }

  /**
   * Test the connection to Zoho CRM API
   * @returns {Promise<boolean>} - True if connection is successful
   */
  async testConnection() {
    try {
      const response = await this.makeRequest('org');
      console.log('✅ Zoho CRM API connection successful');
      console.log('Organization:', response.org?.[0]?.name || 'Unknown');
      return true;
    } catch (error) {
      console.error('❌ Zoho CRM API connection failed:', error.message);
      return false;
    }
  }
}

// Create singleton instance
const zohoAuth = new ZohoAuth();

module.exports = zohoAuth; 