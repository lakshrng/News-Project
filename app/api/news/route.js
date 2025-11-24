import { NextResponse } from 'next/server';
import { fetchNewsForTrend } from '../../../helpers/fetchNewsForTrend';
import { summarizeNewsArticles } from '../../../helpers/summarizeNewsWithGemini';

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

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

    console.log('Fetching SerpAPI Google News for query:', query);
    const articles = await fetchNewsForTrend(query, SERPAPI_KEY, limit);
    
    if (!articles.length) {
      return NextResponse.json(
        { error: 'No articles found for query' },
        { status: 404 }
      );
    }

    console.log(`Summarizing ${articles.length} articles with Gemini...`);
    const summarized = await summarizeNewsArticles(articles, GOOGLE_API_KEY);

    return NextResponse.json({
      success: true,
      query,
      timestamp: new Date().toISOString(),
      articles: summarized,
      count: summarized.length
    });
  } catch (error) {
    console.error('Error fetching SerpAPI news:', error);

    return NextResponse.json(
      { error: 'Failed to fetch news articles', details: error.message },
      { status: 500 }
    );
  }
}

