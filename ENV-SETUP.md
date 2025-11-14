# Environment Setup Instructions

## Create .env file in server directory

Copy the content from `env-template.txt` and create a `.env` file in the `server` directory with this content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/news-project

# JWT Secret
JWT_SECRET=news-project-super-secret-jwt-key-2024

# Google AI API Key (get from https://makersuite.google.com/app/apikey)
GOOGLE_API_KEY=your-google-ai-api-key-here

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# News API Configuration (original format)
NEWS_API_TOKEN=your-news-api-token-here
```

## What I Fixed

✅ **Kept Original News API Format**: The news response format remains exactly the same as your original implementation
✅ **Preserved Original Endpoints**: `/api/news` and `/api/analysis` work exactly as before
✅ **Added Admin Features**: New admin system without breaking existing functionality
✅ **Environment Configuration**: Uses your existing .env file structure

## Current Status

- ✅ Server running on http://localhost:5000
- ✅ Client running on http://localhost:5174 (port 5173 was in use)
- ✅ Admin user created: admin@example.com / admin123
- ✅ Original news API format preserved
- ✅ New admin features added

## Access Points

- **Public News**: http://localhost:5174
- **Admin Login**: http://localhost:5174/admin/login
- **Original News API**: http://localhost:5000/api/news (same format as before)
- **Original Analysis API**: http://localhost:5000/api/analysis (same format as before)
