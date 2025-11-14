const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up News Project...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, 'server', '.env');
const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/news-project

# JWT Secret (change this in production)
JWT_SECRET=news-project-super-secret-jwt-key-2024

# Google AI API Key (get this from https://makersuite.google.com/app/apikey)
GOOGLE_API_KEY=your-google-ai-api-key-here

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# News API Configuration (original format)
NEWS_API_TOKEN=your-news-api-token-here
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file in server directory');
} else {
  console.log('ℹ️  .env file already exists');
}

console.log('\n📋 Next steps:');
console.log('1. Install dependencies:');
console.log('   cd server && npm install');
console.log('   cd ../client && npm install');
console.log('');
console.log('2. Set up MongoDB:');
console.log('   - Install MongoDB locally or use MongoDB Atlas');
console.log('   - Make sure MongoDB is running on localhost:27017');
console.log('');
console.log('3. Get Google AI API Key:');
console.log('   - Visit: https://makersuite.google.com/app/apikey');
console.log('   - Create a new API key');
console.log('   - Update GOOGLE_API_KEY in server/.env');
console.log('');
console.log('4. Start the application:');
console.log('   - Server: cd server && npm run dev');
console.log('   - Client: cd client && npm run dev');
console.log('');
console.log('5. Create admin user:');
console.log('   POST http://localhost:5000/api/auth/create-admin');
console.log('   Body: {"username": "admin", "email": "admin@example.com", "password": "your-password"}');
console.log('');
console.log('6. Access the application:');
console.log('   - Public News: http://localhost:5173');
console.log('   - Admin Login: http://localhost:5173/admin/login');
console.log('');
console.log('🎉 Setup complete!');
