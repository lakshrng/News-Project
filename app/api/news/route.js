import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import NewsCache from '../../../models/NewsCache';
import { fetchNewsForTrend } from '../../../helpers/fetchNewsForTrend';
import { summarizeNewsArticles } from '../../../helpers/summarizeNewsWithGemini';
import crypto from 'crypto';

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const CACHE_DURATION_HOURS = 6; // Cache for 6 hours

// Generate cache key from query and limit
function generateCacheKey(query, limit) {
  const keyString = `${query.toLowerCase().trim()}_${limit}`;
  return crypto.createHash('md5').update(keyString).digest('hex');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'Top news India';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!SERPAPI_KEY) {
      return NextResponse.json(
        { error: 'SERPAPI_KEY not configured' },
        { status: 500 }
      );
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY not configured' },
        { status: 500 }
      );
    }

    await connectDB();

    // Generate cache key
    const cacheKey = generateCacheKey(query, limit);

    // Check for cached result
    const cached = await NewsCache.findOne({ cacheKey });
    const now = new Date();

    if (cached && cached.expiresAt > now) {
      console.log('✅ Returning cached news for query:', query);
      return NextResponse.json({
        success: true,
        query,
        timestamp: cached.createdAt.toISOString(),
        articles: cached.articles,
        count: cached.articles.length,
        cached: true
      });
    }

    // If expired, remove old cache entry
    if (cached && cached.expiresAt <= now) {
      await NewsCache.deleteOne({ cacheKey });
      console.log('🗑️ Removed expired cache for query:', query);
    }

    // Generate new data
    console.log('🔄 Generating new news for query:', query);
    const articles = await fetchNewsForTrend(query, SERPAPI_KEY, limit);
    
    if (!articles.length) {
      return NextResponse.json(
        { error: 'No articles found for query' },
        { status: 404 }
      );
    }

    console.log(`Summarizing ${articles.length} articles with Gemini...`);
    const summarized = await summarizeNewsArticles(articles, GOOGLE_API_KEY);

    // Calculate expiration time (6 hours from now)
    const expiresAt = new Date(now.getTime() + CACHE_DURATION_HOURS * 60 * 60 * 1000);

    // Save to cache
    await NewsCache.findOneAndUpdate(
      { cacheKey },
      {
        query,
        limit,
        cacheKey,
        articles: summarized,
        expiresAt
      },
      { upsert: true, new: true }
    );

    console.log('💾 Cached news for query:', query, 'expires at:', expiresAt);

    return NextResponse.json({
      success: true,
      query,
      timestamp: now.toISOString(),
      articles: summarized,
      count: summarized.length,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching SerpAPI news:', error);

    return NextResponse.json(
      { error: 'Failed to fetch news articles', details: error.message },
      { status: 500 }
    );
  }
}

