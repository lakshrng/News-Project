const express = require('express');
const router = express.Router();
const { 
  generateNews, 
  getAllNews, 
  getNewsById, 
  updateNews, 
  publishNews, 
  deleteNews,
  getDashboardStats,
  getComments,
  moderateComment
} = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin privileges
router.use(verifyToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// News management
router.post('/news/generate', generateNews);
router.get('/news', getAllNews);
router.get('/news/:id', getNewsById);
router.put('/news/:id', updateNews);
router.patch('/news/:id/publish', publishNews);
router.delete('/news/:id', deleteNews);

// Comment moderation
router.get('/comments', getComments);
router.patch('/comments/:id/moderate', moderateComment);

module.exports = router;
