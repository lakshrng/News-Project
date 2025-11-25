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

    // Gemini API key is optional - we'll use original snippets if not available
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'your-google-ai-api-key-here') {
      console.warn('GOOGLE_API_KEY not configured, will use original article snippets');
    }

    console.log('Fetching SerpAPI Google News for query:', query);
    const articles = await fetchNewsForTrend(query, SERPAPI_KEY, limit);
    
    if (!articles.length) {
      return NextResponse.json(
        { error: 'No articles found for query' },
        { status: 404 }
      );
    }

    // Try to summarize with Gemini, but fallback to original snippets if it fails
    let summarized = [];
    if (GOOGLE_API_KEY && GOOGLE_API_KEY !== 'your-google-ai-api-key-here') {
      try {
        console.log(`Summarizing ${articles.length} articles with Gemini...`);
        summarized = await summarizeNewsArticles(articles, GOOGLE_API_KEY);
        
        // If summarization failed or returned empty, use original articles
        if (!summarized || summarized.length === 0) {
          console.warn('Gemini summarization failed or returned empty, using original snippets');
          summarized = articles.map(article => ({
            title: article.title,
            snippet: article.snippet,
            summary: article.snippet || 'No summary available.',
            source: article.source || 'Google News',
            url: article.link || article.url,
            link: article.link || article.url,
            image_url: article.thumbnail || article.image_url || null,
            published_at: article.date || article.published_at || null,
          }));
        }
      } catch (geminiError) {
        console.error('Gemini API error, using original snippets:', geminiError.message);
        // Fallback to original articles if Gemini fails
        summarized = articles.map(article => ({
          title: article.title,
          snippet: article.snippet,
          summary: article.snippet || 'No summary available.',
          source: article.source || 'Google News',
          url: article.link || article.url,
          link: article.link || article.url,
          image_url: article.thumbnail || article.image_url || null,
          published_at: article.date || article.published_at || null,
        }));
      }
    } else {
      // No API key, use original snippets
      console.log('No Gemini API key, using original snippets');
      summarized = articles.map(article => ({
        title: article.title,
        snippet: article.snippet,
        summary: article.snippet || 'No summary available.',
        source: article.source || 'Google News',
        url: article.link || article.url,
        link: article.link || article.url,
        image_url: article.thumbnail || article.image_url || null,
        published_at: article.date || article.published_at || null,
      }));
    }

    // Fetch manually added published news from database
    let manualNewsFormatted = [];
    try {
      await connectDB();
      const manualNews = await News.find({ 
        status: 'published',
        publishedAt: { $exists: true }
      })
        .populate('author', 'username')
        .sort({ publishedAt: -1 })
        .limit(limit);

      // Convert manual news to the same format as SerpAPI news
      manualNewsFormatted = manualNews.map(article => ({
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
    } catch (dbError) {
      console.error('Database error fetching manual news:', dbError.message);
      // Continue without manual news if DB fails
    }

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

