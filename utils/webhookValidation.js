const crypto = require('crypto');

/**
 * Validate webhook signature (if provided by Zoho)
 * @param {Object} req - Express request object
 * @returns {boolean} - Whether the webhook is valid
 */
function validateWebhook(req) {
  // For now, we'll accept all webhooks
  // In production, you should implement proper signature validation
  // when Zoho provides webhook signatures
  
  const signature = req.headers['x-zoho-signature'];
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  if (!signature || !webhookSecret) {
    console.log('⚠️  No webhook signature validation - accepting all webhooks');
    return true; // Accept for now
  }
  
  try {
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
    
    if (!isValid) {
      console.error('❌ Invalid webhook signature');
      return false;
    }
    
    console.log('✅ Webhook signature validated');
    return true;
    
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
}

/**
 * Extract deal information from webhook payload
 * @param {Object} payload - Webhook payload
 * @returns {Object} - Extracted deal information
 */
function extractDealInfo(payload) {
  const dealInfo = {
    dealName: payload.Deal_Name || payload.deal_name || payload.name,
    dealId: payload.Deal_ID || payload.deal_id || payload.id,
    stage: payload.Stage || payload.stage,
    amount: payload.Amount || payload.amount,
    owner: payload.Owner || payload.owner,
    closingDate: payload.Closing_Date || payload.closing_date,
    account: payload.Account || payload.account,
    contact: payload.Contact || payload.contact
  };
  
  // Remove undefined values
  Object.keys(dealInfo).forEach(key => {
    if (dealInfo[key] === undefined) {
      delete dealInfo[key];
    }
  });
  
  return dealInfo;
}

/**
 * Log webhook details for debugging
 * @param {Object} req - Express request object
 */
function logWebhookDetails(req) {
  console.log('📥 Webhook received:');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
}

module.exports = {
  validateWebhook,
  extractDealInfo,
  logWebhookDetails
}; 