import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import News from '../../../../models/News';
import Comment from '../../../../models/Comment';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '../../../../middleware/auth';

export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();

    const results = {
      admin: null,
      articles: 0,
      comments: 0
    };

    // Create Admin User if it doesn't exist
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });

      await adminUser.save();
      results.admin = {
        email: 'admin@example.com',
        password: adminPassword,
        created: true
      };
    } else {
      results.admin = {
        email: adminUser.email,
        created: false
      };
    }

    // Create Sample News Articles if none exist
    const existingNews = await News.countDocuments();
    if (existingNews === 0) {
      const sampleArticles = [
        {
          title: 'Welcome to News Aggregator',
          content: `This is your first news article! The News Aggregator platform allows you to:

- Generate AI-powered news articles
- Manage and publish content
- Moderate comments from readers
- Track analytics and engagement

Get started by exploring the admin dashboard and generating your first article using AI.`,
          summary: 'Welcome to the News Aggregator platform. Learn how to get started with AI-powered news generation.',
          author: adminUser._id,
          category: 'General',
          tags: ['welcome', 'getting-started', 'platform'],
          status: 'published',
          publishedAt: new Date(),
          isFeatured: true
        },
        {
          title: 'Understanding AI-Powered News Generation',
          content: `AI-powered news generation uses advanced language models to create comprehensive, well-structured news articles. 

The system can:
- Generate articles on any topic
- Create engaging headlines and summaries
- Structure content professionally
- Include relevant tags and categories

Simply provide a topic and category, and the AI will generate a complete article ready for review and publication.`,
          summary: 'Learn how AI-powered news generation works and how to use it effectively in your content workflow.',
          author: adminUser._id,
          category: 'Technology',
          tags: ['ai', 'technology', 'content-generation'],
          status: 'published',
          publishedAt: new Date(),
          isFeatured: true
        },
        {
          title: 'Best Practices for Content Management',
          content: `Effective content management is key to running a successful news platform. Here are some best practices:

1. **Review Before Publishing**: Always review AI-generated content before publishing
2. **Add Context**: Enhance articles with relevant images and additional context
3. **Categorize Properly**: Use appropriate categories and tags for better organization
4. **Engage with Comments**: Moderate and respond to reader comments
5. **Track Performance**: Monitor views, likes, and engagement metrics

Following these practices will help you maintain high-quality content and build a loyal readership.`,
          summary: 'Discover best practices for managing your news content effectively and engaging with your audience.',
          author: adminUser._id,
          category: 'Business',
          tags: ['content-management', 'best-practices', 'editorial'],
          status: 'published',
          publishedAt: new Date()
        }
      ];

      for (const articleData of sampleArticles) {
        const article = new News(articleData);
        await article.save();
        results.articles++;
      }
    }

    // Create Sample Comments if none exist
    const existingComments = await Comment.countDocuments();
    if (existingComments === 0) {
      const publishedNews = await News.find({ status: 'published' }).limit(1);
      
      if (publishedNews.length > 0) {
        const sampleComments = [
          {
            content: 'Great article! Very informative and well-written.',
            author: {
              name: 'John Doe',
              email: 'john@example.com'
            },
            news: publishedNews[0]._id,
            isApproved: true
          },
          {
            content: 'This is exactly what I was looking for. Thanks for sharing!',
            author: {
              name: 'Jane Smith',
              email: 'jane@example.com'
            },
            news: publishedNews[0]._id,
            isApproved: true
          },
          {
            content: 'I have a question about this topic. Can someone help?',
            author: {
              name: 'Bob Johnson',
              email: 'bob@example.com'
            },
            news: publishedNews[0]._id,
            isApproved: false
          }
        ];

        for (const commentData of sampleComments) {
          const comment = new Comment(commentData);
          await comment.save();
          results.comments++;
        }
      }
    }

    // Get final counts
    const stats = {
      users: await User.countDocuments(),
      articles: await News.countDocuments(),
      published: await News.countDocuments({ status: 'published' }),
      drafts: await News.countDocuments({ status: 'draft' }),
      comments: await Comment.countDocuments(),
      pendingComments: await Comment.countDocuments({ isApproved: false })
    };

    return NextResponse.json({
      message: 'Database seeded successfully',
      results,
      stats
    });
  } catch (error) {
    console.error('Seed database error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error.message },
      { status: 500 }
    );
  }
}

