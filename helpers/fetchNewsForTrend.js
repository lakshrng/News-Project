/**
 * Fetch top news articles for a given trend using SerpAPI Google News
 * Server-side only - this module uses Node.js-only dependencies
 */

import { createRequire } from 'module';

// Create require function for CommonJS module loading
const require = createRequire(import.meta.url);

// Lazy load CommonJS module
let getJson;
function getSerpApi() {
  if (!getJson) {
    const serpapi = require("serpapi");
    getJson = serpapi.getJson;
  }
  return getJson;
}

/**
 * Fetch top 10 news articles for a given search query
 * @param {string} query - Search query/trend
 * @param {string} apiKey - SerpAPI key
 * @param {number} num - Number of results to fetch (default: 10)
 * @returns {Promise<Array>} Array of news articles
 */
async function fetchNewsForTrend(query, apiKey, num = 10) {
  return new Promise(async (resolve, reject) => {
    if (!apiKey) {
      reject(new Error("SerpAPI key is required"));
      return;
    }

    if (!query) {
      reject(new Error("Search query is required"));
      return;
    }

    const getJsonFunc = getSerpApi();

    getJsonFunc(
      {
        engine: "google",
        q: query,
        tbm: "nws", // Google News search
        num: num,
        api_key: apiKey,
      },
      (json) => {
        if (json.error) {
          reject(new Error(json.error));
          return;
        }

        const newsResults = json["news_results"] || [];
        const articles = newsResults.map((item) => ({
          title: item.title || "",
          snippet: item.snippet || "",
          link: item.link || "",
          source: item.source || "",
          date: item.date || "",
          thumbnail: item.thumbnail || "",
        }));

        resolve(articles);
      }
    );
  });
}

/**
 * Fetch news articles for multiple trends
 * @param {Array<string>} trends - Array of trend queries
 * @param {string} apiKey - SerpAPI key
 * @param {number} numPerTrend - Number of articles per trend (default: 10)
 * @returns {Promise<Object>} Object mapping each trend to its articles
 */
async function fetchNewsForTrends(trends, apiKey, numPerTrend = 10) {
  const results = {};

  for (const trend of trends) {
    try {
      console.log(`Fetching news for trend: ${trend}`);
      const articles = await fetchNewsForTrend(trend, apiKey, numPerTrend);
      results[trend] = articles;
      
      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching news for trend "${trend}":`, error.message);
      results[trend] = [];
    }
  }

  return results;
}

export {
  fetchNewsForTrend,
  fetchNewsForTrends,
};

