import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import News from '../../../../models/News';
import User from '../../../../models/User';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const filter = { status: 'published' };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const articles = await News.find(filter)
      .populate('author', 'username')
      .select('-content')
      .sort({ publishedAt: -1 })
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
    console.error('Get published news error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}

