import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import AnalysisCache from '../../../models/AnalysisCache';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const CACHE_DURATION_HOURS = 6; // Cache for 6 hours

// Generate cache key from title and snippet
function generateCacheKey(title, snippet) {
  const keyString = `${title.toLowerCase().trim()}_${(snippet || '').toLowerCase().trim()}`;
  return crypto.createHash('md5').update(keyString).digest('hex');
}

export async function POST(request) {
  try {
    const { title, snippet } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Missing article title for analysis.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate cache key
    const cacheKey = generateCacheKey(title, snippet);

    // Check for cached result
    const cached = await AnalysisCache.findOne({ cacheKey });
    const now = new Date();

    if (cached && cached.expiresAt > now) {
      console.log('✅ Returning cached analysis for:', title);
      return NextResponse.json({ 
        analysis: cached.analysis,
        cached: true
      });
    }

    // If expired, remove old cache entry
    if (cached && cached.expiresAt <= now) {
      await AnalysisCache.deleteOne({ cacheKey });
      console.log('🗑️ Removed expired analysis cache for:', title);
    }

    // Generate new analysis
    console.log('🔄 Generating new analysis for:', title);
    const prompt = `Give a professional news article, of around 50-100 words of the following news article:\n\nTitle: ${title}\n\nSnippet: ${snippet || ''}`;

    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    // Calculate expiration time (6 hours from now)
    const expiresAt = new Date(now.getTime() + CACHE_DURATION_HOURS * 60 * 60 * 1000);

    // Save to cache
    await AnalysisCache.findOneAndUpdate(
      { cacheKey },
      {
        title,
        snippet: snippet || '',
        cacheKey,
        analysis,
        expiresAt
      },
      { upsert: true, new: true }
    );

    console.log('💾 Cached analysis for:', title, 'expires at:', expiresAt);

    return NextResponse.json({ 
      analysis,
      cached: false
    });
  } catch (error) {
    console.error('Error generating analysis:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}

