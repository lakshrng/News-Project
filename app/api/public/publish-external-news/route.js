import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import News from '../../../../models/News';
import { requireAdmin } from '../../../../middleware/auth';

export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();

    const { title, snippet, url, image_url, published_at, category } = await request.json();

    if (!title || !snippet) {
      return NextResponse.json(
        { error: 'Title and snippet are required' },
        { status: 400 }
      );
    }

    const newsArticle = new News({
      title,
      content: snippet,
      summary: snippet,
      author: authResult.userId,
      category: category || 'General',
      tags: [category?.toLowerCase() || 'general', 'external-news'],
      status: 'published',
      publishedAt: new Date(),
      source: 'External News API',
      externalUrl: url,
      imageUrl: image_url
    });

    await newsArticle.save();

    return NextResponse.json({
      message: 'External news article published successfully',
      article: newsArticle
    }, { status: 201 });
  } catch (error) {
    console.error('Publish external news error:', error);
    return NextResponse.json(
      { error: 'Failed to publish external news article' },
      { status: 500 }
    );
  }
}

