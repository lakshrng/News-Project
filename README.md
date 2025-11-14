# News Aggregator - Next.js

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

```bash
npm run build
npm start
```

## Technologies

- Next.js 14
- React 19
- Google Generative AI (Gemini)
- Axios
- NewsAPI
