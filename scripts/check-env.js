require('dotenv').config();

console.log('🔍 Checking environment variables...\n');

// Check Zoho variables
console.log('📋 Zoho CRM Configuration:');
console.log('ZOHO_CLIENT_ID:', process.env.ZOHO_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('ZOHO_CLIENT_SECRET:', process.env.ZOHO_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('ZOHO_REDIRECT_URI:', process.env.ZOHO_REDIRECT_URI || '❌ Missing');
console.log('ZOHO_REFRESH_TOKEN:', process.env.ZOHO_REFRESH_TOKEN ? '✅ Set' : '❌ Missing');

console.log('\n📋 Google Drive Configuration:');
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_DRIVE_PARENT_FOLDER_ID:', process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || '❌ Missing');

console.log('\n📋 Deployment Configuration:');
console.log('DEPLOYMENT_DATE:', process.env.DEPLOYMENT_DATE || '❌ Missing');

console.log('\n📋 Webhook Configuration:');
console.log('WEBHOOK_SECRET:', process.env.WEBHOOK_SECRET ? '✅ Set' : '❌ Missing');

console.log('\n📋 Server Configuration:');
console.log('PORT:', process.env.PORT || '3000 (default)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development (default)');

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('\n✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  console.log(`📄 .env file has ${lines.length} non-comment lines`);
} else {
  console.log('\n❌ .env file does not exist');
}

console.log('\n🔍 Environment check complete!'); 