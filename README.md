# News Aggregator - Next.js

<<<<<<< Updated upstream
AI-powered news aggregator built with Next.js, featuring real-time news fetching and AI-powered analysis using Google Gemini.

## Features

- 📰 Latest news headlines from NewsAPI
- 🤖 AI-powered article analysis using Google Gemini
- 🔍 Search functionality for news articles
- 📱 Responsive design with modern UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

npm install next@14.2.33 react@18.2.0 react-dom@18.2.0 eslint@8.56.0
npm install -D eslint-config-next@14.2.33

1. Install dependencies:
```bas
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEWS_API_TOKEN=your_news_api_token
GOOGLE_API_KEY=your_google_api_key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── news/         # News fetching endpoint
│   │   └── analysis/     # AI analysis endpoint
│   ├── components/       # React components
│   ├── news/             # News page
│   ├── analysis/         # Analysis page
│   ├── layout.js         # Root layout
│   ├── page.jsx          # Home page
│   └── globals.css       # Global styles
├── config/               # Configuration files
└── package.json
```

## API Routes

- `GET /api/news` - Fetch latest news articles
- `POST /api/analysis` - Generate AI analysis for an article

## Build for Production
=======
A complete news blogging platform built with Next.js, featuring AI-powered news generation, admin management, and public viewing capabilities.

## Features

- 📰 **Published News**: Browse and read published articles
- 🤖 **AI News Generation**: Generate articles using Google Gemini
- 👨‍💼 **Admin Dashboard**: Manage articles, moderate comments
- 💬 **Comment System**: Public comments with moderation
- 🔍 **Search & Filter**: Find articles by category or keywords
- 📊 **Analytics**: View statistics and metrics
- 🔐 **Authentication**: JWT-based auth with role-based access

## Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Google AI API key (for news generation)
- News API token (for external news)

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env.local` file:**
```env
MONGODB_URI=mongodb://localhost:27017/news-project
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GOOGLE_API_KEY=your-google-ai-api-key
NEWS_API_TOKEN=your-news-api-token
ADMIN_PASSWORD=admin123  # Optional: custom admin password for seeding
```

3. **Start MongoDB** (if using local MongoDB)

4. **Seed the database:**
```bash
npm run seed
```

This will create:
- Admin user (admin@example.com / admin123)
- Sample news articles
- Sample comments

5. **Run the development server:**
```bash
npm run dev
```

6. **Open [http://localhost:3000](http://localhost:3000)**
>>>>>>> Stashed changes

## Database Seeding

### Option 1: Using the seed script (Recommended)
```bash
<<<<<<< Updated upstream
npm run build
npm start
```

## Technologies

- Next.js 14
- React 19
- Google Generative AI (Gemini)
- Axios
- NewsAPI
=======
npm run seed
```

### Option 2: Using the API endpoint (requires admin auth)
```bash
# First, create admin user via API
curl -X POST http://localhost:3000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "email": "admin@example.com", "password": "admin123"}'

# Then login and use the seed endpoint
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Option 3: Create admin only
```bash
curl -X POST http://localhost:3000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "email": "admin@example.com", "password": "admin123"}'
```

## Default Admin Credentials

After seeding:
- **Email**: admin@example.com
- **Password**: admin123 (or the value set in ADMIN_PASSWORD env var)

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── admin/        # Admin endpoints
│   │   ├── public/       # Public endpoints
│   │   ├── news/         # News API
│   │   └── analysis/    # AI Analysis
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── news/             # News pages
│   ├── admin/            # Admin pages
│   ├── layout.js         # Root layout
│   └── page.jsx          # Home page
├── lib/                  # Utilities
│   ├── mongodb.js        # MongoDB connection
│   └── auth.js           # Auth utilities
├── models/               # Mongoose models
│   ├── User.js
│   ├── News.js
│   └── Comment.js
├── middleware/           # Middleware
│   └── auth.js
└── scripts/              # Utility scripts
    └── seed-db.js        # Database seeding script
```

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
- `POST /api/admin/seed` - Seed database with sample data

### Public
- `GET /api/public/news` - Get published news
- `GET /api/public/news/featured` - Get featured articles
- `GET /api/public/news/:id` - Get single article with comments
- `POST /api/public/news/:id/comments` - Add comment
- `POST /api/public/news/:id/like` - Like article
- `GET /api/public/categories` - Get categories
- `POST /api/public/publish-external-news` - Publish external news (admin only)

### External
- `GET /api/news` - Get external news from NewsAPI
- `POST /api/analysis` - Generate AI analysis

## Build for Production

```bash
npm run build
npm start
```

## Technologies

- **Next.js 14** - React framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Google Generative AI** - AI content generation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## License

MIT
>>>>>>> Stashed changes
