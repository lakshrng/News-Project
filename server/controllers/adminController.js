const News = require('../models/News');
const Comment = require('../models/Comment');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

// Initialize the AI client
const ai = env.GOOGLE_API_KEY && env.GOOGLE_API_KEY !== 'your-google-ai-api-key-here' 
  ? new GoogleGenerativeAI(env.GOOGLE_API_KEY) 
  : null;

// Generate news article using AI
const generateNews = async (req, res) => {
  try {
    const { topic, category = 'General' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    let articleData;

    if (ai) {
      // Use AI to generate content
      const prompt = `Create a comprehensive news article about "${topic}". 
      The article should be:
      - Well-structured with a compelling headline
      - Informative and factual
      - 500-800 words long
      - Include a brief summary (2-3 sentences)
      - Professional and engaging tone
      - Include relevant details and context
      - End with a conclusion
      
      Format the response as JSON with the following structure:
      {
        "title": "Article title here",
        "content": "Full article content here",
        "summary": "Brief summary here",
        "tags": ["tag1", "tag2", "tag3"]
      }`;

      const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Try to parse the JSON response
      try {
        // Clean the response to extract JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          articleData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // If JSON parsing fails, create a structured response manually
        articleData = {
          title: `News Article: ${topic}`,
          content: response,
          summary: `A comprehensive article about ${topic}`,
          tags: [category.toLowerCase(), topic.toLowerCase()]
        };
      }
    } else {
      // Fallback: Create a template article when AI is not available
      articleData = {
        title: `Breaking News: ${topic}`,
        content: `This is a news article about ${topic} in the ${category} category.

Introduction:
${topic} has become a significant topic of discussion in recent times. This article explores the various aspects and implications of this important subject.

Main Content:
The topic of ${topic} encompasses several key areas that are worth examining. From a ${category.toLowerCase()} perspective, there are multiple factors to consider when analyzing this subject.

Key Points:
• First, it's important to understand the background and context of ${topic}
• Second, we need to examine the current state and developments
• Third, we should consider the future implications and potential outcomes

Analysis:
The significance of ${topic} cannot be overstated. It represents an important development in the field of ${category.toLowerCase()} and has far-reaching implications for various stakeholders.

Conclusion:
In conclusion, ${topic} represents an important area of focus that requires continued attention and analysis. As developments continue to unfold, it will be important to monitor the situation closely and adapt strategies accordingly.

This article provides a foundation for understanding ${topic} and serves as a starting point for further research and discussion.`,
        summary: `A comprehensive analysis of ${topic} in the ${category} category, covering key aspects, implications, and future considerations.`,
        tags: [category.toLowerCase(), topic.toLowerCase().replace(/\s+/g, '-'), 'news', 'analysis']
      };
    }

    // Create draft news article
    const newsArticle = new News({
      title: articleData.title,
      content: articleData.content,
      summary: articleData.summary,
      author: req.userId,
      category,
      tags: articleData.tags || [category.toLowerCase()],
      status: 'draft'
    });

    await newsArticle.save();

    res.json({
      message: 'News article generated successfully',
      article: newsArticle
    });
  } catch (error) {
    console.error('News generation error:', error);
    res.status(500).json({ error: 'Failed to generate news article' });
  }
};

// Get all news articles (admin view)
const getAllNews = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    const articles = await News.find(filter)
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await News.countDocuments(filter);

    res.json({
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to fetch news articles' });
  }
};

// Get single news article
const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await News.findById(id).populate('author', 'username email');
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ article });
  } catch (error) {
    console.error('Get news by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

// Update news article
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const article = await News.findById(id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        article[key] = updates[key];
      }
    });

    await article.save();

    res.json({
      message: 'Article updated successfully',
      article
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
};

// Publish news article
const publishNews = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await News.findById(id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    article.status = 'published';
    article.publishedAt = new Date();
    await article.save();

    res.json({
      message: 'Article published successfully',
      article
    });
  } catch (error) {
    console.error('Publish news error:', error);
    res.status(500).json({ error: 'Failed to publish article' });
  }
};

// Delete news article
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await News.findById(id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await News.findByIdAndDelete(id);
    
    // Also delete related comments
    await Comment.deleteMany({ news: id });

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalArticles = await News.countDocuments();
    const publishedArticles = await News.countDocuments({ status: 'published' });
    const draftArticles = await News.countDocuments({ status: 'draft' });
    const totalComments = await Comment.countDocuments();
    const pendingComments = await Comment.countDocuments({ isApproved: false });

    const recentArticles = await News.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
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
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// Get all comments for moderation
const getComments = async (req, res) => {
  try {
    const { isApproved, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (isApproved !== undefined) {
      filter.isApproved = isApproved === 'true';
    }

    const comments = await Comment.find(filter)
      .populate('news', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments(filter);

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Approve/reject comment
const moderateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.isApproved = isApproved;
    await comment.save();

    res.json({
      message: `Comment ${isApproved ? 'approved' : 'rejected'} successfully`,
      comment
    });
  } catch (error) {
    console.error('Moderate comment error:', error);
    res.status(500).json({ error: 'Failed to moderate comment' });
  }
};

module.exports = {
  generateNews,
  getAllNews,
  getNewsById,
  updateNews,
  publishNews,
  deleteNews,
  getDashboardStats,
  getComments,
  moderateComment
};
