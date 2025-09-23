// controllers/newsController.js
const axios = require("axios");

// Helper to safely parse Gemini JSON output (strip code fences if present)
function parseJsonLoose(text) {
  try {
    const cleaned = (text || "")
      .replace(/^```(json)?/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (_) {
    return null;
  }
}

// Extract text from Gemini REST API response
function extractTextFromResponse(response) {
  try {
    const candidate = response?.candidates?.[0];
    if (candidate?.content?.parts?.[0]?.text) {
      return candidate.content.parts[0].text;
    }
    return "";
  } catch {
    return "";
  }
}

// Generic function to call Gemini REST API
async function callGemini(model, prompt) {
  const API_KEY = process.env.GOOGLE_API_KEY;
  if (!API_KEY) throw new Error("GOOGLE_API_KEY is missing");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const headers = { "Content-Type": "application/json" };
  const maskedUrl = url.replace(API_KEY, "***");

  console.log("=== Gemini API Request ===");
  console.log("URL:", maskedUrl);
  console.log("Headers:", headers);
  console.log("Body:", JSON.stringify(body, null, 2));

  const resp = await axios.post(url, body, { headers });

  console.log("\n=== Gemini API Response ===");
  console.log("Status:", resp.status);
  console.log("Raw JSON:", JSON.stringify(resp.data, null, 2));

  const text = extractTextFromResponse(resp.data);

  console.log("\n=== Extracted Text ===");
  console.log(text || "(no text found)");

  return text;
}

// Fetch latest trending news (last 24h) via SerpAPI Google News (Global only)
async function fetchSerpApiTrendingNews(minArticles = 24) {
  const API_KEY = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY;
  if (!API_KEY) return null;

  const endpoint = 'https://serpapi.com/search.json';
  const axiosCfg = { timeout: 12000 };

  function mapItems(items, regionLabel) {
    if (!Array.isArray(items)) return [];
    return items
      .filter(x => x && (x.link || x.url) && x.title)
      .map(x => {
        const link = x.link || x.url;
        const published = x.published_utc || x.date || x.date_utc || '';
        const iso = (() => {
          const d = Date.parse(published);
          return isFinite(d) ? new Date(d).toISOString() : new Date().toISOString();
        })();
        const image = x.thumbnail || x.image || (x.images && x.images[0]) || '';
        return {
          title: x.title,
          snippet: x.snippet || x.subtitle || x.excerpt || '',
          image_url: image || '',
          url: link,
          published_at: iso,
          category: 'Trending',
          region: regionLabel
        };
      })
      .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
  }

  async function fetchRegion(gl, regionLabel) {
    const params = new URLSearchParams({
      engine: 'google_news',
      hl: 'en',
      gl,
      // Use World topic for global top stories
      topic: 'world',
      // ceid is required for some top stories requests: `${country}:${language}`
      ceid: `${gl}:en`,
      num: '100',
      api_key: API_KEY
    });
    const url = `${endpoint}?${params.toString()}`;
    const resp = await axios.get(url, axiosCfg);
    const data = resp?.data || {};
    const base = Array.isArray(data.news_results) ? data.news_results : [];
    // Some results have nested stories; flatten a bit
    const nested = base.flatMap(item => Array.isArray(item.stories) ? item.stories : []);
    const combined = base.concat(nested);
    return mapItems(combined, regionLabel);
  }

  // Global trending only: use US as the global feed
  const world = await fetchRegion('US', 'World');
  let picks = world.slice(0, minArticles);
  if (picks.length < minArticles) {
    for (const a of world) {
      if (picks.find(p => p.url === a.url)) continue;
      picks.push(a);
      if (picks.length >= minArticles) break;
    }
  }

  // Filter strictly to last 24h
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const within24h = picks.filter(a => {
    const t = Date.parse(a.published_at || '');
    return isFinite(t) && t >= cutoff;
  });
  return within24h;
}

// Fetch real latest news by categories (last 24h) via TheNewsAPI with 70/30 region split
async function fetchRealLatestNewsByCategories() {
  const API_TOKEN = process.env.THE_NEWS_API_TOKEN; // https://www.thenewsapi.com/
  if (!API_TOKEN) return null;
  const now = new Date();
  const fromIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const axiosCfg = { timeout: 12000 };

  const base = 'https://api.thenewsapi.com/v1/news/all';
  const cutoffMs = now.getTime() - 24 * 60 * 60 * 1000;
  const within24h = a => {
    const t = Date.parse(a.published_at || "");
    return isFinite(t) && t >= cutoffMs;
  };

  function mapArticles(data, regionLabel, topicLabel) {
    const list = data?.data;
    if (!Array.isArray(list)) return [];
    return list
      .filter(a => a && a.title && a.url)
      .map(a => ({
        title: a.title,
        snippet: a.description || a.snippet || "",
        image_url: a.image_url || "",
        url: a.url,
        published_at: a.published_at || new Date().toISOString(),
        category: `${topicLabel}`,
        region: regionLabel
      }))
      .filter(within24h)
      .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
  }

  async function fetchCategory(topicKey, displayLabel, minPerCategory = 12) {
    const common = `api_token=${API_TOKEN}&language=en&categories=${encodeURIComponent(topicKey)}&published_after=${encodeURIComponent(fromIso)}`;
    const urlIndia = `${base}?${common}&locale=in`;
    const urlWorld = `${base}?${common}`; // global
    const [indiaResp, worldResp] = await Promise.allSettled([
      axios.get(urlIndia, axiosCfg),
      axios.get(urlWorld, axiosCfg)
    ]);
    const indiaList = indiaResp.status === 'fulfilled' ? mapArticles(indiaResp.value?.data, 'India', displayLabel) : [];
    const worldList = worldResp.status === 'fulfilled' ? mapArticles(worldResp.value?.data, 'World', displayLabel) : [];
    // 70/30 split
    const indiaTarget = Math.max(0, Math.ceil(minPerCategory * 0.7));
    const worldTarget = Math.max(0, minPerCategory - indiaTarget);
    const picks = indiaList.slice(0, indiaTarget).concat(worldList.slice(0, worldTarget));
    if (picks.length < minPerCategory) {
      const merged = indiaList.concat(worldList);
      for (const a of merged) {
        if (picks.find(p => p.url === a.url)) continue;
        picks.push(a);
        if (picks.length >= minPerCategory) break;
      }
    }
    return picks;
  }

  const categories = [
    { key: 'politics', label: 'Politics' },
    { key: 'business', label: 'Business' },
    { key: 'sports', label: 'Sports' },
    { key: 'science', label: 'Science' }
  ];

  const results = await Promise.all(categories.map(c => fetchCategory(c.key, c.label, 12)));
  return results.flat();
}

// Generate news-like articles with Gemini by category (fallback)
exports.getNews = async (req, res) => {
  try {
    // Try SerpAPI first (Trending - last 24h)
    let articles = null;
    try {
      const serp = await fetchSerpApiTrendingNews(28);
      if (serp && serp.length) {
        const marqueeItems = serp.map(a => ({ title: a.title, url: a.url }));
        return res.render("news", { articles: serp, marqueeItems });
      }
    } catch (e) {
      console.warn("⚠️ SerpAPI fetch failed:", e?.message || e);
    }

    // TEMPORARILY DISABLED: TheNewsAPI fallback
    /*
    try {
      articles = await fetchRealLatestNewsByCategories();
    } catch (e) {
      console.warn("⚠️ Real news fetch failed:", e?.message || e);
    }
    */

    if (articles && articles.length) {
      const marqueeItems = articles.map(a => ({ title: a.title, url: a.url }));
      return res.render("news", { articles, marqueeItems });
    }

    // TEMPORARILY DISABLED: Gemini synthetic fallback
    /*
    // ... Gemini-based synthetic generation fallback was here ...
    */

    // If SerpAPI returned nothing, render empty list
    return res.render("news", { articles: [], marqueeItems: [] });
  } catch (error) {
    console.error("❌ Error generating AI news:", error.message);
    res.status(500).render("error", { message: "Could not generate AI news." });
  }
};

// Generate AI-powered analysis for a given article
exports.getAnalysis = async (req, res) => {
  try {
    const { title, snippet } = req.body;
    const prompt = `Provide a concise, reader-friendly political analysis in 400-500 words of the following Indian news article. Avoid bullet points; use short paragraphs.\n\nTitle: ${title}\n\nSnippet: ${snippet}`;

    // Call Gemini (exact same as test.js)
    const text = await callGemini("gemini-1.5-pro-latest", prompt);

    res.json({ analysis: text });
  } catch (error) {
    console.error("❌ Error generating analysis:", error.message);
    res.status(500).json({ error: "Failed to generate analysis" });
  }
};

// Render analysis page
exports.renderAnalysisPage = (req, res) => {
  try {
    const { title = "", snippet = "", image_url = "" } = req.query;
    if (!title) {
      return res.render("error", { message: "Missing article title for analysis." });
    }
    res.render("analysis", { title, snippet, image_url });
  } catch (error) {
    console.error("❌ Error rendering analysis page:", error.message);
    res.render("error", { message: "Could not open analysis page." });
  }
};
