import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import News from '@/models/News';
import Comment from '@/models/Comment';

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const { content, author } = await request.json();

    const article = await News.findById(id).where('status').equals('published');
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found or not published' },
        { status: 404 }
      );
    }

    if (!content || !author.name || !author.email) {
      return NextResponse.json(
        { error: 'Content and author information are required' },
        { status: 400 }
      );
    }

    const comment = new Comment({
      content,
      author,
      news: id,
      isApproved: false
    });

    await comment.save();

    return NextResponse.json({
      message: 'Comment submitted successfully. It will be reviewed before being published.',
      comment: {
        id: comment._id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

