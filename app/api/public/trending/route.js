import { NextResponse } from 'next/server';
import { fetchTrendingSearches, fetchInterestOverTime } from '../../../../helpers/fetchTrends';
import { summarizeTrendsWithGemini } from '../../../../helpers/summarizeTrendWithGemini';
import connectDB from '../../../../lib/mongodb';
import News from '../../../../models/News';

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

    // Gemini API key is optional - we'll use fallback summaries if not available
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'your-google-ai-api-key-here') {
      console.warn('GOOGLE_API_KEY not configured, will use fallback summaries');
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

    // Step 3: Summarize each trend with Gemini (with fallback)
    let summaries = [];
    if (GOOGLE_API_KEY && GOOGLE_API_KEY !== 'your-google-ai-api-key-here') {
      try {
        console.log('Summarizing trends with Gemini...');
        summaries = await summarizeTrendsWithGemini(trendsWithData, GOOGLE_API_KEY);
        
        // If summarization failed, create fallback summaries
        if (!summaries || summaries.length === 0) {
          console.warn('Gemini summarization failed, using fallback summaries');
          summaries = trendsWithData.map(({ topic }) => ({
            topic,
            summary: `${topic} is currently trending and generating significant public interest. Stay updated with the latest developments on this topic.`,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (geminiError) {
        console.error('Gemini API error, using fallback summaries:', geminiError.message);
        summaries = trendsWithData.map(({ topic }) => ({
          topic,
          summary: `${topic} is currently trending and generating significant public interest. Stay updated with the latest developments on this topic.`,
          timestamp: new Date().toISOString()
        }));
      }
    } else {
      // No API key, use fallback summaries
      console.log('No Gemini API key, using fallback summaries');
      summaries = trendsWithData.map(({ topic }) => ({
        topic,
        summary: `${topic} is currently trending and generating significant public interest. Stay updated with the latest developments on this topic.`,
        timestamp: new Date().toISOString()
      }));
    }

    // Step 4: Fetch manually added published news that match trending topics
    await connectDB();
    const trendKeywords = topTrends.map(t => t.toLowerCase()).filter(t => t.trim().length > 0);
    
    // Build search query to find matching news
    let matchingNews = [];
    if (trendKeywords.length > 0) {
      // Escape special regex characters in keywords
      const escapedKeywords = trendKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const regexPattern = escapedKeywords.join('|');
      
      matchingNews = await News.find({
        status: 'published',
        publishedAt: { $exists: true },
        $or: [
          { title: { $regex: regexPattern, $options: 'i' } },
          { summary: { $regex: regexPattern, $options: 'i' } },
          { tags: { $in: trendKeywords } },
          { category: { $in: trendKeywords } }
        ]
      })
        .populate('author', 'username')
        .sort({ publishedAt: -1 })
        .limit(limit * 2); // Get more to match with trends
    }

    // Match manual news to trending topics
    const manualTrends = [];
    for (const trend of topTrends) {
      const trendLower = trend.toLowerCase();
      const matchingArticles = matchingNews.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(trendLower);
        const summaryMatch = article.summary.toLowerCase().includes(trendLower);
        const tagMatch = article.tags.some(tag => tag.toLowerCase().includes(trendLower));
        const categoryMatch = article.category.toLowerCase().includes(trendLower);
        return titleMatch || summaryMatch || tagMatch || categoryMatch;
      });

      if (matchingArticles.length > 0) {
        // Use the most recent matching article
        const article = matchingArticles[0];
        manualTrends.push({
          topic: trend,
          summary: article.summary,
          imageUrl: article.imageUrl || article.featuredImage || null,
          articleId: article._id.toString(),
          articleTitle: article.title,
          isManual: true,
          timestamp: article.publishedAt || article.createdAt
        });
      }
    }

    // Merge manual trends with AI-generated summaries
    // If a manual article exists for a trend, prioritize it
    const mergedTrends = summaries.map(aiTrend => {
      const manualMatch = manualTrends.find(m => 
        m.topic.toLowerCase() === aiTrend.topic.toLowerCase()
      );
      
      if (manualMatch) {
        return {
          ...manualMatch,
          summary: manualMatch.summary || aiTrend.summary,
          timestamp: manualMatch.timestamp || aiTrend.timestamp
        };
      }
      return aiTrend;
    });

    // Add manual trends that don't have AI summaries
    const aiTopics = summaries.map(t => t.topic.toLowerCase());
    manualTrends.forEach(manual => {
      if (!aiTopics.includes(manual.topic.toLowerCase())) {
        mergedTrends.push(manual);
      }
    });

    return NextResponse.json({
      success: true,
      geo,
      timestamp: new Date().toISOString(),
      trends: mergedTrends,
      count: mergedTrends.length,
      manualCount: manualTrends.length,
      aiCount: summaries.length
    });
  } catch (error) {
    console.error('Trending news error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending news', details: error.message },
      { status: 500 }
    );
  }
}

