import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import News from '../../../../models/News';
import Comment from '../../../../models/Comment';
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

    const totalArticles = await News.countDocuments();
    const publishedArticles = await News.countDocuments({ status: 'published' });
    const draftArticles = await News.countDocuments({ status: 'draft' });
    const totalComments = await Comment.countDocuments();
    const pendingComments = await Comment.countDocuments({ isApproved: false });

    const recentArticles = await News.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      stats: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalComments,
        pendingComments
      },
      recentArticles
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

