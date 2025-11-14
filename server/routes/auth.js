const express = require('express');
const router = express.Router();
const { register, login, getProfile, createAdmin } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/create-admin', createAdmin); // For initial admin setup

// Protected routes
router.get('/profile', verifyToken, getProfile);

module.exports = router;
