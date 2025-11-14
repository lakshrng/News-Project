import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Comment from '../../../../models/Comment';
import { requireAdmin } from '../../../../middleware/auth';

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
    const { isApproved } = await request.json();

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    comment.isApproved = isApproved;
    await comment.save();

    return NextResponse.json({
      message: `Comment ${isApproved ? 'approved' : 'rejected'} successfully`,
      comment
    });
  } catch (error) {
    console.error('Moderate comment error:', error);
    return NextResponse.json(
      { error: 'Failed to moderate comment' },
      { status: 500 }
    );
  }
}

