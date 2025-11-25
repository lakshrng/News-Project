import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import News from '@/models/News';
import { requireAdmin } from '@/middleware/auth';

export async function PATCH(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();

    const { id } = params;

    const article = await News.findById(id);
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    article.status = 'published';
    article.publishedAt = new Date();
    await article.save();

    return NextResponse.json({
      message: 'Article published successfully',
      article
    });
  } catch (error) {
    console.error('Publish news error:', error);
    return NextResponse.json(
      { error: 'Failed to publish article' },
      { status: 500 }
    );
  }
}

