/**
 * Database Seeding Script
 * Run with: node scripts/seed-db.js
 * 
 * This script populates the database with:
 * - Admin user (if doesn't exist)
 * - Sample news articles
 * - Sample comments
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/news-project';

// Define schemas inline for the seed script
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true },
  summary: { type: String, required: true, maxlength: 500 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  tags: [{ type: String, trim: true }],
  category: { type: String, required: true, trim: true },
  featuredImage: { type: String, default: '' },
  publishedAt: { type: Date, default: null },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  source: { type: String, default: 'Admin Generated' },
  externalUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true, maxlength: 1000 },
  author: {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, trim: true, lowercase: true }
  },
  news: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true },
  isApproved: { type: Boolean, default: false },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const News = mongoose.models.News || mongoose.model('News', newsSchema);
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await News.deleteMany({});
    // await Comment.deleteMany({});
    // console.log('🗑️  Cleared existing data');

    // Create Admin User
    console.log('\n📝 Creating admin user...');
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
    } else {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });

      await admin.save();
      console.log('✅ Admin user created:');
      console.log('   Email: admin@example.com');
      console.log('   Password: ' + adminPassword);
    }

    // Create Sample News Articles
    console.log('\n📰 Creating sample news articles...');
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Cannot create news articles.');
      return;
    }

    const existingNews = await News.countDocuments();
    if (existingNews > 0) {
      console.log(`ℹ️  ${existingNews} news articles already exist. Skipping sample articles.`);
    } else {
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
        console.log(`   ✅ Created: ${article.title}`);
      }
    }

    // Create Sample Comments
    console.log('\n💬 Creating sample comments...');
    const publishedNews = await News.find({ status: 'published' }).limit(1);
    
    if (publishedNews.length > 0) {
      const existingComments = await Comment.countDocuments();
      if (existingComments === 0) {
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
            isApproved: false // Pending moderation
          }
        ];

        for (const commentData of sampleComments) {
          const comment = new Comment(commentData);
          await comment.save();
          console.log(`   ✅ Created comment from ${comment.author.name}`);
        }
      } else {
        console.log(`ℹ️  ${existingComments} comments already exist. Skipping sample comments.`);
      }
    }

    // Summary
    console.log('\n📊 Database Summary:');
    const userCount = await User.countDocuments();
    const newsCount = await News.countDocuments();
    const commentCount = await Comment.countDocuments();
    const publishedCount = await News.countDocuments({ status: 'published' });
    const draftCount = await News.countDocuments({ status: 'draft' });
    const pendingComments = await Comment.countDocuments({ isApproved: false });

    console.log(`   Users: ${userCount}`);
    console.log(`   News Articles: ${newsCount} (${publishedCount} published, ${draftCount} drafts)`);
    console.log(`   Comments: ${commentCount} (${pendingComments} pending moderation)`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n🔑 Admin Login Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: ' + (process.env.ADMIN_PASSWORD || 'admin123'));

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('\n✨ Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding process failed:', error);
    process.exit(1);
  });

