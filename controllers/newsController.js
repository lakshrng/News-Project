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
async function callGemini(model, prompt, tools) {
  const API_KEY = process.env.GOOGLE_API_KEY;
  if (!API_KEY) throw new Error("GOOGLE_API_KEY is missing");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    ...(Array.isArray(tools) && tools.length ? { tools } : {})
  };

  const headers = { "Content-Type": "application/json" };
  const maskedUrl = url.replace(API_KEY, "***");

  console.log("=== Gemini API Request ===");
  console.log("URL:", maskedUrl);
  console.log("Headers:", headers);
  console.log("Body:", JSON.stringify(body, null, 2));

  let resp;
  try {
    resp = await axios.post(url, body, { headers });
  } catch (err) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    console.error("Gemini API Error:", status, JSON.stringify(data));
    throw err;
  }

  console.log("\n=== Gemini API Response ===");
  console.log("Status:", resp.status);
  console.log("Raw JSON:", JSON.stringify(resp.data, null, 2));

  const text = extractTextFromResponse(resp.data);

  console.log("\n=== Extracted Text ===");
  console.log(text || "(no text found)");

  return text;
}

// Fetch news by categories via SerpAPI Google News
async function fetchSerpApiByCategories() {
  const API_KEY = process.env.SERP_API;
  if (!API_KEY) return null;

  const endpoint = 'https://serpapi.com/search.json';
  const axiosCfg = { timeout: 15000 };

  function mapItems(items, categoryLabel) {
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
          category: categoryLabel
        };
      })
      .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
  }

  async function fetchCategory(query, categoryLabel, gl = 'us') {
    const params = new URLSearchParams({
      engine: 'google_news',
      q: query,
      gl: gl,
      hl: 'en',
      num: '50',
      api_key: API_KEY
    });

    const url = `${endpoint}?${params.toString()}`;
    const resp = await axios.get(url, axiosCfg);
    const data = resp?.data || {};
    const base = Array.isArray(data.news_results) ? data.news_results : [];
    // Flatten nested stories
    const nested = base.flatMap(item => Array.isArray(item.stories) ? item.stories : []);
    const combined = base.concat(nested);
    return mapItems(combined, categoryLabel);
  }

  // Fetch multiple categories in parallel
  const [politicsResults, sportsResults, businessResults, scienceResults] = await Promise.allSettled([
    fetchCategory('politics election government', 'Politics'),
    fetchCategory('sports cricket football tennis', 'Sports'), 
    fetchCategory('business economy stock market', 'Business'),
    fetchCategory('science technology research', 'Science')
  ]);

  // Extract successful results
  const politics = politicsResults.status === 'fulfilled' ? politicsResults.value : [];
  const sports = sportsResults.status === 'fulfilled' ? sportsResults.value : [];
  const business = businessResults.status === 'fulfilled' ? businessResults.value : [];
  const science = scienceResults.status === 'fulfilled' ? scienceResults.value : [];

  // Filter to last 24h and limit per category
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const filterRecent = (articles) => articles
    .filter(a => {
      const t = Date.parse(a.published_at || '');
      return isFinite(t) && t >= cutoff;
    })
    .slice(0, 12); // Limit to 12 per category

  const categorized = {
    politics: filterRecent(politics),
    sports: filterRecent(sports),
    business: filterRecent(business),
    science: filterRecent(science)
  };

  // Create "latest" from all categories (top 15)
  const allArticles = [...politics, ...sports, ...business, ...science]
    .filter(a => {
      const t = Date.parse(a.published_at || '');
      return isFinite(t) && t >= cutoff;
    })
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
    .slice(0, 15);

  categorized.latest = allArticles;

  console.log('📊 SerpAPI Categories fetched:', {
    latest: categorized.latest.length,
    politics: categorized.politics.length,
    sports: categorized.sports.length,
    business: categorized.business.length,
    science: categorized.science.length
  });

  return categorized;
}


// Generate news-like articles with Gemini by category (fallback)
exports.getNews = async (req, res) => {
  try {
    // Try SerpAPI for categorized news
    let articlesByCategory = null;
    try {
      articlesByCategory = await fetchSerpApiByCategories();
      if (articlesByCategory && articlesByCategory.latest?.length) {
        const marqueeItems = articlesByCategory.latest.map(a => ({ title: a.title, url: a.url }));
        return res.render("news", { articlesByCategory, marqueeItems });
      }
    } catch (e) {
      console.warn("⚠️ SerpAPI fetch failed:", e?.message || e);
    }

    // DISABLED: TheNewsAPI for categorized news
    /*
    try {
      articles = await fetchRealLatestNewsByCategories();
      console.log('✅ TheNewsAPI fetch successful:', articles ? 'Got data' : 'No data');
    } catch (e) {
      console.error("❌ Real news fetch failed:", e?.message || e);
      console.error("Stack:", e?.stack);
    }
    */

    // If no articles, render empty categories structure
    const emptyCategories = {
      latest: [],
      politics: [],
      sports: [],
      business: [],
      science: []
    };
    return res.render("news", { articlesByCategory: emptyCategories, marqueeItems: [] });
  } catch (error) {
    console.error("❌ Error generating AI news:", error.message);
    res.status(500).render("error", { message: "Could not generate AI news." });
  }
};

// Generate AI-powered analysis for a given article
exports.getAnalysis = async (req, res) => {
  try {
    const { title, snippet } = req.body;
    const prompt = [
      "Provide a concise, reader-friendly political analysis in 350-450 words of the following Indian news article.",
      "Output STRICT HTML only (no markdown, no code fences).",
      "Use short paragraphs (2-4 sentences each).",
      "Highlight political entities (people, parties, institutions, ministries) by wrapping them in:",
      "<span style=\"color:#d00; font-weight:600\">ENTITY</span>",
      "Highlight sentiment-bearing phrases (clear positive/negative judgments or emotional tone) by wrapping them in:",
      "<span style=\"background: #ffeb3b\">PHRASE</span>",
      "Do NOT use any other HTML tags beyond <p> and <span>.",
      "Do NOT include external links, scripts, images, or styles.",
      `Article Title: ${title}`,
      `Snippet: ${snippet}`
    ].join("\n");

    // Grounding disabled for now; keeping for future use
    /*
    const tools = [ { googleSearch: {} } ];
    const text = await callGemini("gemini-2.5-flash", prompt, tools);
    */
    const text = await callGemini("gemini-2.5-flash", prompt);

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
