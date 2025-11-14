import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Comment from '../../../../models/Comment';
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
    const isApproved = searchParams.get('isApproved');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filter = {};
    if (isApproved !== undefined) {
      filter.isApproved = isApproved === 'true';
    }

    const comments = await Comment.find(filter)
      .populate('news', 'title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments(filter);

    return NextResponse.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

