<<<<<<< HEAD
# 📰 News Project - Admin Blogging System

A complete news blogging platform where admins can generate, manage, and publish AI-generated news articles, while the public can view and comment on published content.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Google AI API key (for news generation)

### 2. Installation

```bash
# Clone or navigate to the project directory
cd News-Project

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

The project is already configured with default settings. You can customize by editing `server/config/env.js`:

```javascript
module.exports = {
  PORT: 5000,
  MONGODB_URI: 'mongodb://localhost:27017/news-project',
  JWT_SECRET: 'news-project-super-secret-jwt-key-2024',
  GOOGLE_API_KEY: 'your-google-ai-api-key-here',
  CLIENT_URL: 'http://localhost:5173'
};
```

### 4. Get Google AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Update `GOOGLE_API_KEY` in `server/config/env.js`

### 5. Start the Application

```bash
# Terminal 1 - Start Server
cd server
npm run dev

# Terminal 2 - Start Client
cd client
npm run dev
```

### 6. Create Admin User

```bash
# Run the admin creation script
node create-admin.js
```

Or manually:
```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "email": "admin@example.com", "password": "admin123"}'
```

### 7. Access the Application

- **Public News**: http://localhost:5173
- **Admin Login**: http://localhost:5173/admin/login
- **Admin Dashboard**: http://localhost:5173/admin/dashboard

## 🎯 Features

### Admin Features
- ✅ **AI News Generation**: Generate articles using Google AI
- ✅ **Content Management**: Edit, review, and publish articles
- ✅ **Comment Moderation**: Approve/reject public comments
- ✅ **Analytics Dashboard**: View statistics and metrics
- ✅ **User Management**: Secure admin authentication

### Public Features
- ✅ **News Browsing**: View published articles
- ✅ **Article Reading**: Full article display with formatting
- ✅ **Comment System**: Add comments (requires approval)
- ✅ **Search & Filter**: Find articles by category or keywords
- ✅ **Like System**: Like your favorite articles

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Authentication**: JWT-based with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Google Generative AI for content creation
- **API**: RESTful endpoints for admin and public access

### Frontend (React + Vite)
- **Admin Dashboard**: News management interface
- **Public Interface**: News browsing and reading
- **Responsive Design**: Mobile-friendly UI
- **Real-time Updates**: Toast notifications and state management

## 📊 Database Schema

### Users
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: 'admin' | 'user',
  isActive: Boolean
}
```

### News
```javascript
{
  title: String,
  content: String,
  summary: String,
  author: ObjectId (User),
  status: 'draft' | 'published' | 'archived',
  category: String,
  tags: [String],
  publishedAt: Date,
  views: Number,
  likes: Number
}
```

### Comments
```javascript
{
  content: String,
  author: { name: String, email: String },
  news: ObjectId (News),
  isApproved: Boolean,
  createdAt: Date
}
```

## 🔌 API Endpoints

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

## 🛠️ Development

### Project Structure
```
News-Project/
├── server/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Authentication middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── index.js        # Server entry point
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/   # Admin components
│   │   │   └── Public/  # Public components
│   │   └── App.jsx      # Main app component
│   └── package.json
└── README.md
```

### Adding New Features
1. **Backend**: Add routes in `server/routes/`
2. **Frontend**: Add components in `client/src/components/`
3. **Database**: Update models in `server/models/`

## 🔒 Security

- JWT tokens for authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation
- Role-based access control

## 🚀 Deployment

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `GOOGLE_API_KEY`: Google AI API key
- `CLIENT_URL`: Frontend URL for CORS

### Production Checklist
- [ ] Change JWT_SECRET to a secure random string
- [ ] Use MongoDB Atlas or secure MongoDB instance
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Add rate limiting
- [ ] Implement input validation
- [ ] Add error logging

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository.

---

**Happy Coding! 🎉**
=======
# News-Project

#Run command
    -npm start
>>>>>>> 4f70c6083a8db5fb99a3dcd7842bce38f7bdff11
