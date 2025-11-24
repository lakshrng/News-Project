import { NextResponse } from 'next/server';
import { fetchTrendingSearches, fetchInterestOverTime } from '../../../../helpers/fetchTrends';
import { summarizeTrendsWithGemini } from '../../../../helpers/summarizeTrendWithGemini';

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function GET(request) {
  try {
    if (!SERPAPI_KEY) {
      return NextResponse.json(
        { error: 'SERPAPI_KEY is not configured' },
        { status: 500 }
      );
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const geo = searchParams.get('geo') || 'IN';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Step 1: Fetch top trending topics in India
    console.log(`Fetching trending searches for geo: ${geo}...`);
    const trends = await fetchTrendingSearches(geo, SERPAPI_KEY);
    
    if (!trends || trends.length === 0) {
      return NextResponse.json(
        { error: 'No trending searches found' },
        { status: 404 }
      );
    }

    // Take top N trends (default 10)
    const topTrends = trends.slice(0, limit);
    console.log(`Selected ${topTrends.length} top trends:`, topTrends);

    // Step 2: Fetch interest over time data for each trend
    console.log('Fetching interest over time data for each trend...');
    const trendsWithData = [];

    // Process trends individually to get detailed data for each
    for (const trend of topTrends) {
      try {
        console.log(`Fetching interest data for: ${trend}`);
        const interestData = await fetchInterestOverTime([trend], SERPAPI_KEY);
        trendsWithData.push({
          topic: trend,
          interestData: interestData
        });
        
        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error fetching interest data for "${trend}":`, error.message);
        trendsWithData.push({
          topic: trend,
          interestData: null
        });
      }
    }

    // Step 3: Summarize each trend with Gemini
    console.log('Summarizing trends with Gemini...');
    const summaries = await summarizeTrendsWithGemini(trendsWithData, GOOGLE_API_KEY);

    return NextResponse.json({
      success: true,
      geo,
      timestamp: new Date().toISOString(),
      trends: summaries,
      count: summaries.length
    });
  } catch (error) {
    console.error('Trending news error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending news', details: error.message },
      { status: 500 }
    );
  }
}

