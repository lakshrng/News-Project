import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import News from '../../../../models/News';
import Comment from '../../../../models/Comment';
import User from '../../../../models/User';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    
    const article = await News.findById(id)
      .populate('author', 'username')
      .where('status').equals('published');
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found or not published' },
        { status: 404 }
      );
    }

    article.views += 1;
    await article.save();

    const comments = await Comment.find({ 
      news: id, 
      isApproved: true 
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      article,
      comments
    });
  } catch (error) {
    console.error('Get news article error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

