module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/news-project',
  
  // JWT Secret
  JWT_SECRET: process.env.JWT_SECRET || 'news-project-super-secret-jwt-key-2024',
  
  // Google AI API Key
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || 'AIzaSyBEV9DwsIyRzjfehvWayobXqbYIQAaY6Ow',
  
  // Client URL (for CORS)
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // News API Configuration (original format)
  NEWS_API_TOKEN: process.env.NEWS_API_TOKEN || 'G51GV4UQtn1ccEZzzTKH4vPcoIToB2pcaYfP7Vuz'
};
