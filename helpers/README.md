# Trends to News Workflow Helpers

This directory contains helper functions for the trending topics to news articles workflow.

## Files

- **fetchTrends.js** - Fetches Google Trends data using SerpAPI
- **fetchNewsForTrend.js** - Fetches top news articles for each trend
- **processWithGemini.js** - Processes articles with Google Gemini AI to generate comprehensive news articles

## Setup

1. Install dependencies:
```bash
npm install serpapi
```

2. Add to your `.env.local` file:
```env
SERPAPI_KEY=your_serpapi_key_here
GOOGLE_API_KEY=your_google_gemini_api_key_here
```

## Usage

The workflow is orchestrated through the API endpoint:
`POST /api/admin/trends/generate`

This endpoint:
1. Fetches trending searches from Google Trends
2. For each trend, fetches top 10 news articles
3. Processes all articles with Gemini to generate comprehensive news articles
4. Saves articles to the database

