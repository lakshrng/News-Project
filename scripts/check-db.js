/**
 * Database Check Script
 * Run with: node scripts/check-db.js
 * 
 * This script checks the database connection and shows what's in the database
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/news-project';

// Define schemas inline
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

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    console.log('📡 MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***@')); // Hide credentials
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📚 Collections found:', collections.map(c => c.name).join(', ') || 'None');
    console.log('');

    // Count documents
    const userCount = await User.countDocuments();
    const newsCount = await News.countDocuments();
    const commentCount = await Comment.countDocuments();
    const publishedCount = await News.countDocuments({ status: 'published' });
    const draftCount = await News.countDocuments({ status: 'draft' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    console.log('📊 Database Summary:');
    console.log('   Users:', userCount, `(${adminCount} admin)`);
    console.log('   News Articles:', newsCount, `(${publishedCount} published, ${draftCount} drafts)`);
    console.log('   Comments:', commentCount);
    console.log('');

    // Show admin users
    if (adminCount > 0) {
      console.log('👤 Admin Users:');
      const admins = await User.find({ role: 'admin' }).select('username email createdAt');
      admins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.username}) - Created: ${admin.createdAt}`);
      });
      console.log('');
    }

    // Show recent articles
    if (newsCount > 0) {
      console.log('📰 Recent Articles (last 5):');
      const articles = await News.find().sort({ createdAt: -1 }).limit(5).select('title status category createdAt');
      articles.forEach(article => {
        console.log(`   - ${article.title} [${article.status}] - ${article.category} - ${article.createdAt}`);
      });
      console.log('');
    }

    // Show comments
    if (commentCount > 0) {
      console.log('💬 Comments:');
      const comments = await Comment.find().sort({ createdAt: -1 }).limit(5).select('author.name isApproved createdAt');
      comments.forEach(comment => {
        const status = comment.isApproved ? '✅ Approved' : '⏳ Pending';
        console.log(`   - ${comment.author.name} - ${status} - ${comment.createdAt}`);
      });
      console.log('');
    }

    if (userCount === 0 && newsCount === 0 && commentCount === 0) {
      console.log('⚠️  Database is empty!');
      console.log('💡 Run: npm run seed');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure MongoDB is running!');
      console.error('   - Local: Start MongoDB service');
      console.error('   - Atlas: Check connection string');
    }
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the check
checkDatabase()
  .then(() => {
    console.log('\n✨ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });

