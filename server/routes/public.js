const express = require('express');
const router = express.Router();
const { 
  getPublishedNews, 
  getNewsArticle, 
  addComment, 
  getCategories, 
  getFeaturedNews,
  likeArticle,
  publishExternalNews
} = require('../controllers/publicController');

// Public routes - no authentication required
router.get('/news', getPublishedNews);
router.get('/news/featured', getFeaturedNews);
router.get('/news/:id', getNewsArticle);
router.post('/news/:id/comments', addComment);
router.post('/news/:id/like', likeArticle);
router.get('/categories', getCategories);

// Publish external news to homepage (requires admin authentication)
router.post('/publish-external-news', require('../middleware/auth').verifyToken, require('../middleware/auth').requireAdmin, publishExternalNews);

module.exports = router;
