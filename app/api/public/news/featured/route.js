import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import News from '../../../../models/News';
import User from '../../../../models/User';

export async function GET(request) {
  try {
    await connectDB();

    const articles = await News.find({ 
      status: 'published',
      isFeatured: true 
    })
    .populate('author', 'username')
    .select('-content')
    .sort({ publishedAt: -1 })
    .limit(5);

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Get featured news error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured articles' },
      { status: 500 }
    );
  }
}

