import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import News from '../../../../models/News';
import User from '../../../../models/User';
import { requireAdmin } from '../../../../middleware/auth';

// Import helpers
import { fetchTrendingSearches } from '../../../../helpers/fetchTrends';
import { fetchNewsForTrends } from '../../../../helpers/fetchNewsForTrend';
import { processTrendsWithGemini } from '../../../../helpers/processWithGemini';

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    if (!SERPAPI_KEY) {
      return NextResponse.json(
        { error: 'SERPAPI_KEY is not configured in environment variables' },
        { status: 500 }
      );
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY is not configured in environment variables' },
        { status: 500 }
      );
    }

    const { geo = 'IN', maxTrends = 5, autoPublish = false } = await request.json();

    await connectDB();

    // Step 1: Fetch trending searches
    console.log(`Fetching trending searches for geo: ${geo}...`);
    const trends = await fetchTrendingSearches(geo, SERPAPI_KEY);
    
    if (!trends || trends.length === 0) {
      return NextResponse.json(
        { error: 'No trending searches found' },
        { status: 404 }
      );
    }

    // Limit to maxTrends
    const selectedTrends = trends.slice(0, maxTrends);
    console.log(`Selected ${selectedTrends.length} trends:`, selectedTrends);

    // Step 2: Fetch top 10 news articles for each trend
    console.log('Fetching news articles for each trend...');
    const trendsWithArticles = await fetchNewsForTrends(selectedTrends, SERPAPI_KEY, 10);

    // Step 3: Process articles with Gemini
    console.log('Processing articles with Gemini...');
    const generatedArticles = await processTrendsWithGemini(trendsWithArticles, GOOGLE_API_KEY);

    // Step 4: Save articles to database
    const savedArticles = [];
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 500 }
      );
    }

    for (const [trend, articleData] of Object.entries(generatedArticles)) {
      if (!articleData) {
        console.log(`Skipping trend "${trend}" - no article data generated`);
        continue;
      }

      try {
        const newsArticle = new News({
          title: articleData.title,
          content: articleData.content,
          summary: articleData.summary,
          author: adminUser._id,
          category: articleData.category,
          tags: articleData.tags,
          status: autoPublish ? 'published' : 'draft',
          publishedAt: autoPublish ? new Date() : null,
          source: 'Trending Topics',
          isFeatured: false
        });

        await newsArticle.save();
        savedArticles.push({
          trend,
          article: newsArticle,
          status: 'saved'
        });

        console.log(`Saved article for trend: ${trend}`);
      } catch (error) {
        console.error(`Error saving article for trend "${trend}":`, error);
        savedArticles.push({
          trend,
          error: error.message,
          status: 'failed'
        });
      }
    }

    return NextResponse.json({
      message: 'Trending articles generated successfully',
      summary: {
        trendsFetched: trends.length,
        trendsProcessed: selectedTrends.length,
        articlesGenerated: Object.keys(generatedArticles).filter(k => generatedArticles[k] !== null).length,
        articlesSaved: savedArticles.filter(a => a.status === 'saved').length,
        articlesFailed: savedArticles.filter(a => a.status === 'failed').length
      },
      trends: selectedTrends,
      articles: savedArticles
    });
  } catch (error) {
    console.error('Trends generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate trending articles', details: error.message },
      { status: 500 }
    );
  }
}

