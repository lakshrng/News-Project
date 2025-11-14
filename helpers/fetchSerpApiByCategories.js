const axios = require("axios");
require("dotenv").config();

const SERP_API_KEY = process.env.SERP_API_KEY;

console.log(
  "🔑 Loaded SerpAPI key (first 8 chars):",
  SERP_API_KEY ? SERP_API_KEY.slice(0, 8) : "Missing ❌"
);

async function fetchSerpApiByCategories() {
  const categories = ["latest", "politics", "sports", "business", "science"];
  const results = {};

  for (const category of categories) {
    try {
      const response = await axios.get("https://serpapi.com/search", {
        params: {
          q: `${category} news`,
          engine: "google_news", // correct engine
          api_key: SERP_API_KEY,
          hl: "en",
          gl: "us"
        },
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      // Take only first 5 articles
      const items = (response.data.news_results || []).slice(0, 5);

      results[category] = items.map(item => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet || "",
        image_url: item.thumbnail || "",
        published_at: item.date || "",
        category
      }));

      console.log(`✅ Fetched ${items.length} ${category} articles`);
    } catch (err) {
      console.warn(
        `⚠️ Failed to fetch ${category} news:`,
        err.response?.data?.error || err.message
      );
      results[category] = [];
    }
  }

  return results;
}

module.exports = fetchSerpApiByCategories;
