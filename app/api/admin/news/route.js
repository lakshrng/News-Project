import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import News from '../../../../models/News';
import User from '../../../../models/User';
import { requireAdmin } from '../../../../middleware/auth';

export async function GET(request) {
  try {
    const authResult = await requireAdmin(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const articles = await News.find(filter)
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await News.countDocuments(filter);

    return NextResponse.json({
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get news error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}

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

    const {
      title,
      content,
      summary,
      category,
      tags,
      imageUrl,
      featuredImage,
      externalUrl,
      source,
      status = 'published',
      isFeatured = false
    } = await request.json();

    if (!title || !content || !summary || !category) {
      return NextResponse.json(
        { error: 'Title, content, summary, and category are required' },
        { status: 400 }
      );
    }

    const newsArticle = new News({
      title,
      content,
      summary,
      author: authResult.userId,
      category,
      tags: tags || [category.toLowerCase()],
      status,
      imageUrl: imageUrl || featuredImage || '',
      featuredImage: featuredImage || imageUrl || '',
      externalUrl: externalUrl || '',
      source: source || 'Manual Entry',
      isFeatured,
      publishedAt: status === 'published' ? new Date() : null
    });

    await newsArticle.save();

    return NextResponse.json({
      message: 'News article created successfully',
      article: newsArticle
    }, { status: 201 });
  } catch (error) {
    console.error('Create news error:', error);
    return NextResponse.json(
      { error: 'Failed to create news article', details: error.message },
      { status: 500 }
    );
  }
}

