/**
 * Fetch Google Trends using SerpAPI
 * Returns trending searches for a given geo location
 */

// Dynamic import for CommonJS module
let getJson;
async function getSerpApi() {
  if (!getJson) {
    const serpapi = await import("serpapi");
    getJson = serpapi.getJson;
  }
  return getJson;
}

/**
 * Fetch trending searches from Google Trends
 * @param {string} geo - Geographic location code (e.g., "IN" for India, "US" for United States)
 * @param {string} apiKey - SerpAPI key
 * @returns {Promise<Array>} Array of trending search terms
 */
async function fetchTrendingSearches(geo = "IN", apiKey) {
  return new Promise(async (resolve, reject) => {
    if (!apiKey) {
      reject(new Error("SerpAPI key is required"));
      return;
    }

    const getJsonFunc = await getSerpApi();

    getJsonFunc(
      {
        engine: "google_trends_trending_now",
        geo: geo,
        api_key: apiKey,
      },
      (json) => {
        if (json.error) {
          reject(new Error(json.error));
          return;
        }

        const trendingSearches = json["trending_searches"] || [];
        const trends = trendingSearches.map((item) => {
          // Extract the search query from the trending search item
          return item.query || item.title || item;
        }).filter(Boolean);

        resolve(trends);
      }
    );
  });
}

/**
 * Fetch interest over time data for multiple queries
 * @param {Array<string>} queries - Array of search queries
 * @param {string} apiKey - SerpAPI key
 * @returns {Promise<Object>} Interest over time data
 */
async function fetchInterestOverTime(queries, apiKey) {
  return new Promise(async (resolve, reject) => {
    if (!apiKey) {
      reject(new Error("SerpAPI key is required"));
      return;
    }

    if (!queries || queries.length === 0) {
      reject(new Error("At least one query is required"));
      return;
    }

    const queryString = queries.join(",");
    const getJsonFunc = await getSerpApi();

    getJsonFunc(
      {
        engine: "google_trends",
        q: queryString,
        data_type: "TIMESERIES",
        api_key: apiKey,
      },
      (json) => {
        if (json.error) {
          reject(new Error(json.error));
          return;
        }

        resolve(json["interest_over_time"] || {});
      }
    );
  });
}

export {
  fetchTrendingSearches,
  fetchInterestOverTime,
};

