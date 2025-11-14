# Google AI API Key Setup

## Why You Need This
The news generation feature uses Google's Generative AI to create high-quality news articles. Without the API key, the system will use template articles instead.

## How to Get Your API Key

### Step 1: Visit Google AI Studio
Go to: https://makersuite.google.com/app/apikey

### Step 2: Sign In
- Sign in with your Google account
- If you don't have a Google account, create one

### Step 3: Create API Key
- Click "Create API Key"
- Choose "Create API key in new project" or select an existing project
- Copy the generated API key

### Step 4: Add to Your Project
1. Open `server/.env` file
2. Replace `your-google-ai-api-key-here` with your actual API key:
   ```
   GOOGLE_API_KEY=your-actual-api-key-here
   ```

### Step 5: Restart Server
- Stop the server (Ctrl+C)
- Start it again: `npm run dev`

## What Happens After Setup

✅ **With API Key**: AI generates high-quality, unique news articles
❌ **Without API Key**: System uses template articles (still functional)

## Cost Information
- Google AI API has a free tier with generous limits
- Check current pricing at: https://ai.google.dev/pricing

## Troubleshooting

### "Failed to generate news article"
- Check if API key is correctly set in `.env`
- Verify the API key is valid
- Check server console for error messages

### "API key not found"
- Make sure `.env` file is in the `server` directory
- Restart the server after adding the API key
- Check for typos in the environment variable name

## Security Note
- Never commit your API key to version control
- Keep your `.env` file private
- The `.env` file is already in `.gitignore`
