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

// Generate news-like articles with Gemini by category
exports.getNews = async (req, res) => {
  try {
    const source = req.method === "POST" ? req.body : req.query;
    const { category = "general", language = "en" } = source || {};

    const prompt = [
      "You are generating synthetic, plausible news headlines and snippets for a demo.",
      "Return STRICT JSON only (no code fences, no markdown).",
      "Schema: { articles: Array<{ title: string; snippet: string; image_url: string; url: string; source: string; published_at: string; category: string }> }",
      "Constraints:",
      `- category must be '${category}' (one of general, business, sports, politics, technology, entertainment, science, health)`,
      "- Create 5 diverse items with different angles and sources.",
      `- Use language '${language}'.`,
      "- Simulate 'published_at' within the last 48 hours in ISO 8601.",
      "- Provide short readable 'snippet' (25-55 words).",
      "- Provide 'source' as a plausible outlet name.",
      "- image_url MUST be a valid https stock/placeholder image URL (e.g., https://images.unsplash.com/... or https://picsum.photos/seed/...).",
      "- url MUST be an https link (can be plausible, not necessarily real)."
    ].join("\n");

    // Call Gemini (exact same as test.js)
    const text = await callGemini("gemini-1.5-pro-latest", prompt);

    // Parse JSON
    let parsed = parseJsonLoose(text);
    if (!parsed || !Array.isArray(parsed.articles)) {
      parsed = { articles: [] };
    }

    const articles = parsed.articles.map((a, i) => {
      const cat = (a.category || category || 'general').toString();
      const fallbackImage = `https://picsum.photos/seed/${encodeURIComponent(cat)}-${i}/800/450`;
      const fallbackUrl = `https://news.example.com/${encodeURIComponent(cat)}/${i + 1}`;
      return {
        title: a.title || "Untitled",
        snippet: a.snippet || "",
        image_url: (a.image_url && String(a.image_url).startsWith('http')) ? a.image_url : fallbackImage,
        url: (a.url && String(a.url).startsWith('http')) ? a.url : fallbackUrl,
        source: a.source || "AI Generated",
        published_at: a.published_at || new Date().toISOString(),
        category: a.category || category
      };
    });

    res.render("news", { articles });
  } catch (error) {
    console.error("❌ Error generating AI news:", error.message);
    res.status(500).render("error", { message: "Could not generate AI news." });
  }
};

// Generate AI-powered analysis for a given article
exports.getAnalysis = async (req, res) => {
  try {
    const { title, snippet } = req.body;
    const prompt = `Provide a 50-100 word, reader-friendly analysis of the following news article:\n\nTitle: ${title}\n\nSnippet: ${snippet}`;

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
