const jwt = require('jsonwebtoken');
const User = require('../models/User');

const env = require('../config/env');
const JWT_SECRET = env.JWT_SECRET;

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error while checking admin privileges.' });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
    }
  }
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  requireAdmin,
  optionalAuth
};
