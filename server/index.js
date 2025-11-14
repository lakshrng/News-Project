const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");

// Load env (try project root .env)
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();

// Import environment configuration
const env = require('./config/env');

// Connect to MongoDB
mongoose.connect(env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// CORS configuration
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));

// Views and static assets served from within server folder
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Legacy server-rendered routes
const legacyRoutes = require(path.join(__dirname, "routes", "news"));
app.use("/", legacyRoutes);

// JSON API for client
const { getNewsJson, getAnalysisJson } = require(path.join(__dirname, "routes", "serverApi"));
const apiRouter = express.Router();
apiRouter.get("/news", getNewsJson);
apiRouter.post("/analysis", getAnalysisJson);

// Debug endpoint to check API key
apiRouter.get("/debug", (req, res) => {
  const { API_KEY, API_URL } = require('./config/config');
  const env = require('./config/env');
  res.json({
    apiKeySet: !!API_KEY,
    apiKeyLength: API_KEY ? API_KEY.length : 0,
    apiUrl: API_URL,
    env: {
      newsApiToken: env.NEWS_API_TOKEN ? "Set" : "Not set",
      googleApiKey: env.GOOGLE_API_KEY && env.GOOGLE_API_KEY !== 'your-google-ai-api-key-here' ? "Set" : "Not set"
    }
  });
});

// Simple external news endpoint
apiRouter.get("/external-news", async (req, res) => {
  try {
    const NEWS_API_TOKEN = 'G51GV4UQtn1ccEZzzTKH4vPcoIToB2pcaYfP7Vuz';
    const API_URL = 'https://api.thenewsapi.com/v1/news/top';
    
    const response = await axios.get(API_URL, {
      params: {
        api_token: NEWS_API_TOKEN
      }
    });

    const items = response.data?.data || [];
    const articles = items.map((n) => ({
      title: n.title,
      snippet: n.description || n.snippet || "",
      url: n.url,
      image_url: n.image_url || n.image_url_small || "",
      published_at: n.published_at || n.date || "",
      category: n.categories?.[0] || n.category || ""
    }));

    res.json({ articles });
  } catch (error) {
    console.error("External news error:", error.message);
    res.status(500).json({ articles: [], error: error.message });
  }
});

app.use("/api", apiRouter);

// New API routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// 404
app.use((req, res) => {
  res.status(404).render("error", { message: "Page not found!" });
});

// Server
app.listen(env.PORT, () => console.log(`✅ Server running on http://localhost:${env.PORT}`));


