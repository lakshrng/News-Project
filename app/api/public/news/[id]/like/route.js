import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import News from '@/models/News';

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    
    const article = await News.findById(id).where('status').equals('published');
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found or not published' },
        { status: 404 }
      );
    }

    article.likes += 1;
    await article.save();

    return NextResponse.json({
      message: 'Article liked successfully',
      likes: article.likes
    });
  } catch (error) {
    console.error('Like article error:', error);
    return NextResponse.json(
      { error: 'Failed to like article' },
      { status: 500 }
    );
  }
}

