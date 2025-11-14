# News Project Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Google AI API key (for news generation)

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/news-project

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Google AI API Key
GOOGLE_API_KEY=your-google-ai-api-key

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# News API Configuration
NEWS_API_KEY=your-news-api-key
NEWS_API_URL=https://newsdata.io/api/1/news
```

## Installation

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Install Client Dependencies
```bash
cd client
npm install
```

### 3. Start MongoDB
Make sure MongoDB is running on your system.

### 4. Start the Server
```bash
cd server
npm run dev
```

### 5. Start the Client
```bash
cd client
npm run dev
```

## Initial Setup

### 1. Create Admin User
Once the server is running, create an admin user by making a POST request to:
```
POST http://localhost:5000/api/auth/create-admin
```

With the following body:
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "your-secure-password"
}
```

### 2. Access the Application
- **Public News**: http://localhost:5173
- **Admin Login**: http://localhost:5173/admin/login
- **Admin Dashboard**: http://localhost:5173/admin/dashboard

## Features

### Admin Features
- Generate news articles using AI
- Edit and manage news articles
- Publish/unpublish articles
- Moderate comments
- View dashboard statistics

### Public Features
- View published news articles
- Read full articles
- Add comments (requires approval)
- Like articles
- Search and filter news

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/create-admin` - Create admin user
- `GET /api/auth/profile` - Get user profile

### Admin (Protected)
- `GET /api/admin/dashboard` - Dashboard statistics
- `POST /api/admin/news/generate` - Generate news article
- `GET /api/admin/news` - Get all news articles
- `GET /api/admin/news/:id` - Get single article
- `PUT /api/admin/news/:id` - Update article
- `PATCH /api/admin/news/:id/publish` - Publish article
- `DELETE /api/admin/news/:id` - Delete article
- `GET /api/admin/comments` - Get comments for moderation
- `PATCH /api/admin/comments/:id/moderate` - Approve/reject comment

### Public
- `GET /api/public/news` - Get published news
- `GET /api/public/news/:id` - Get single article with comments
- `POST /api/public/news/:id/comments` - Add comment
- `POST /api/public/news/:id/like` - Like article
- `GET /api/public/categories` - Get categories
- `GET /api/public/news/featured` - Get featured articles

## Database Schema

### Users
- username, email, password, role, isActive

### News
- title, content, summary, author, status, tags, category, featuredImage, publishedAt, views, likes, isFeatured

### Comments
- content, author (name, email), news, isApproved, parentComment, likes

## Security Notes
- Change JWT_SECRET in production
- Use strong passwords for admin accounts
- Implement rate limiting in production
- Use HTTPS in production
- Validate all inputs
