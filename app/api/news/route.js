import { NextResponse } from 'next/server';
import { fetchNewsForTrend } from '../../../helpers/fetchNewsForTrend';
import { summarizeNewsArticles } from '../../../helpers/summarizeNewsWithGemini';
import connectDB from '../../../lib/mongodb';
import News from '../../../models/News';

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

    // Fetch manually added published news from database
    await connectDB();
    const manualNews = await News.find({ 
      status: 'published',
      publishedAt: { $exists: true }
    })
      .populate('author', 'username')
      .sort({ publishedAt: -1 })
      .limit(limit);

    // Convert manual news to the same format as SerpAPI news
    const manualNewsFormatted = manualNews.map(article => ({
      title: article.title,
      summary: article.summary,
      snippet: article.summary,
      source: article.source || 'Manual Entry',
      link: article.externalUrl || `/news/${article._id}`,
      url: article.externalUrl || `/news/${article._id}`,
      image_url: article.imageUrl || article.featuredImage || null,
      published_at: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : null,
      isManual: true,
      _id: article._id.toString()
    }));

    // Merge manual news with SerpAPI news (manual news first, then SerpAPI)
    const allArticles = [...manualNewsFormatted, ...summarized];

    return NextResponse.json({
      success: true,
      query,
      timestamp: new Date().toISOString(),
      articles: allArticles,
      count: allArticles.length,
      manualCount: manualNewsFormatted.length,
      apiCount: summarized.length
    });
  } catch (error) {
    console.error('Error fetching SerpAPI news:', error);

    return NextResponse.json(
      { error: 'Failed to fetch news articles', details: error.message },
      { status: 500 }
    );
  }
}

