# Zoho CRM Custom Field Setup

This guide will help you set up the custom field in Zoho CRM to store Google Drive links.

## Prerequisites

- ✅ Zoho CRM admin access
- ✅ Your integration is deployed and working

## Step 1: Create Custom Field in Zoho CRM

### 1.1 Access Setup
1. **Log in to Zoho CRM**
2. **Go to Setup** (gear icon in top right)
3. **Navigate to**: Customization → Modules and Fields → Deals

### 1.2 Create Custom Field
1. **Click "Add Custom Fields"**
2. **Select "Text" field type**
3. **Configure the field**:
   - **Field Label**: `Google Drive Link`
   - **Field Name**: `Google_Drive_Link` (this is important!)
   - **Field Type**: Text
   - **Maximum Length**: 500 characters
   - **Help Text**: "Link to the Google Drive folder for this deal"
   - **Make it visible**: Check "Visible" checkbox
   - **Make it editable**: Check "Editable" checkbox

### 1.3 Save the Field
1. **Click "Save"**
2. **Verify the field appears** in your Deals module

## Step 2: Update Configuration

### 2.1 Update Deployment Date
Edit `config/deployment.js` and set your actual deployment date:

```javascript
DEPLOYMENT_DATE: '2024-01-15T00:00:00Z', // Change to your deployment date
```

### 2.2 Verify Field Name
Make sure the field name matches in the config:

```javascript
GOOGLE_DRIVE_LINK_FIELD: 'Google_Drive_Link', // Must match Zoho CRM field name
```

## Step 3: Test the Integration

### 3.1 Test with Old Deal (Should Skip)
```bash
curl -X POST https://zoho.techlab.live/zoho-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "Deal_Name": "Old Deal Test",
    "Deal_ID": "123456789",
    "Created_Time": "2024-01-10T10:00:00Z"
  }'
```

**Expected Response**: Deal should be skipped

### 3.2 Test with New Deal (Should Process)
```bash
curl -X POST https://zoho.techlab.live/zoho-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "Deal_Name": "New Deal Test",
    "Deal_ID": "987654321",
    "Created_Time": "2024-01-20T10:00:00Z"
  }'
```

**Expected Response**: Folder created and deal updated

## Step 4: Verify in Zoho CRM

### 4.1 Check the Deal
1. **Go to Deals** in Zoho CRM
2. **Find the test deal**
3. **Look for the "Google Drive Link" field**
4. **Click the link** to verify it opens the correct folder

### 4.2 Check the Notes
1. **Open the deal details**
2. **Go to Notes tab**
3. **Verify the note** about folder creation

## Troubleshooting

### Issue: Field Not Found
**Error**: `"Field not found: Google_Drive_Link"`

**Solution**:
1. Check the field name in Zoho CRM matches exactly
2. Make sure the field is visible and editable
3. Verify the field is added to the Deals module

### Issue: Deal Not Updated
**Error**: `"Failed to update deal in Zoho CRM"`

**Solution**:
1. Check your Zoho OAuth2 credentials
2. Verify the deal ID exists in Zoho CRM
3. Check API permissions for the deal module

### Issue: Old Deals Being Processed
**Problem**: Deals created before deployment are being processed

**Solution**:
1. Update the `DEPLOYMENT_DATE` in `config/deployment.js`
2. Make sure the date format is correct: `YYYY-MM-DDTHH:mm:ssZ`

## Field Configuration Options

### Option A: URL Field (Recommended)
- **Field Type**: URL
- **Validation**: Automatically validates URL format
- **Display**: Shows as clickable link

### Option B: Text Field
- **Field Type**: Text
- **Validation**: Manual URL validation
- **Display**: Shows as plain text

### Option C: Rich Text Field
- **Field Type**: Rich Text
- **Validation**: Can include formatting
- **Display**: Can include HTML links

## Security Considerations

1. **Field Permissions**: Only allow authorized users to edit the field
2. **URL Validation**: Consider adding URL validation in Zoho CRM
3. **Access Control**: Restrict field access based on user roles

## Monitoring

### Check Field Usage
1. **Go to Setup** → **Analytics** → **Field Usage**
2. **Filter by**: Google Drive Link field
3. **Monitor**: How often the field is populated

### Check Integration Logs
1. **Monitor your deployment logs**
2. **Look for**: Successful field updates
3. **Watch for**: Failed update attempts

---

**Need Help?** Check the main README.md for general troubleshooting or create an issue in the repository. 