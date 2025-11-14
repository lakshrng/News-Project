import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import News from '../../../../models/News';
import Comment from '../../../../models/Comment';
import User from '../../../../models/User';
import { requireAdmin } from '../../../../middleware/auth';

export async function GET(request, { params }) {
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
    const article = await News.findById(id).populate('author', 'username email');
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Get news by ID error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
    const updates = await request.json();

    const article = await News.findById(id);
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        article[key] = updates[key];
      }
    });

    await article.save();

    return NextResponse.json({
      message: 'Article updated successfully',
      article
    });
  } catch (error) {
    console.error('Update news error:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    await News.findByIdAndDelete(id);
    await Comment.deleteMany({ news: id });

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}

