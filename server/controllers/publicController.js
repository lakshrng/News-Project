const News = require('../models/News');
const Comment = require('../models/Comment');

// Get published news articles for public display
const getPublishedNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
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
      .select('-content') // Don't send full content in list view
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await News.countDocuments(filter);

    res.json({
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get published news error:', error);
    res.status(500).json({ error: 'Failed to fetch news articles' });
  }
};

// Get single published news article with comments
const getNewsArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await News.findById(id)
      .populate('author', 'username')
      .where('status').equals('published');
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found or not published' });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    // Get approved comments
    const comments = await Comment.find({ 
      news: id, 
      isApproved: true 
    }).sort({ createdAt: -1 });

    res.json({
      article,
      comments
    });
  } catch (error) {
    console.error('Get news article error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

// Add comment to news article
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;

    // Check if article exists and is published
    const article = await News.findById(id).where('status').equals('published');
    if (!article) {
      return res.status(404).json({ error: 'Article not found or not published' });
    }

    if (!content || !author.name || !author.email) {
      return res.status(400).json({ error: 'Content and author information are required' });
    }

    const comment = new Comment({
      content,
      author,
      news: id,
      isApproved: false // Comments need approval by default
    });

    await comment.save();

    res.status(201).json({
      message: 'Comment submitted successfully. It will be reviewed before being published.',
      comment: {
        id: comment._id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const categories = await News.distinct('category', { status: 'published' });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get featured articles
const getFeaturedNews = async (req, res) => {
  try {
    const articles = await News.find({ 
      status: 'published',
      isFeatured: true 
    })
    .populate('author', 'username')
    .select('-content')
    .sort({ publishedAt: -1 })
    .limit(5);

    res.json({ articles });
  } catch (error) {
    console.error('Get featured news error:', error);
    res.status(500).json({ error: 'Failed to fetch featured articles' });
  }
};

// Like an article
const likeArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await News.findById(id).where('status').equals('published');
    if (!article) {
      return res.status(404).json({ error: 'Article not found or not published' });
    }

    article.likes += 1;
    await article.save();

    res.json({
      message: 'Article liked successfully',
      likes: article.likes
    });
  } catch (error) {
    console.error('Like article error:', error);
    res.status(500).json({ error: 'Failed to like article' });
  }
};

// Publish external news article to homepage
const publishExternalNews = async (req, res) => {
  try {
    const { title, snippet, url, image_url, published_at, category } = req.body;

    if (!title || !snippet) {
      return res.status(400).json({ error: 'Title and snippet are required' });
    }

    // Create a new news article from external source
    const newsArticle = new News({
      title,
      content: snippet, // Use snippet as content for external news
      summary: snippet,
      author: req.userId, // Admin who published it
      category: category || 'General',
      tags: [category?.toLowerCase() || 'general', 'external-news'],
      status: 'published',
      publishedAt: new Date(),
      source: 'External News API',
      externalUrl: url,
      imageUrl: image_url
    });

    await newsArticle.save();

    res.status(201).json({
      message: 'External news article published successfully',
      article: newsArticle
    });
  } catch (error) {
    console.error('Publish external news error:', error);
    res.status(500).json({ error: 'Failed to publish external news article' });
  }
};

module.exports = {
  getPublishedNews,
  getNewsArticle,
  addComment,
  getCategories,
  getFeaturedNews,
  likeArticle,
  publishExternalNews
};
