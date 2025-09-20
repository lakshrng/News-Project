const axios = require("axios");
const { API_URL, API_KEY } = require("../config/config");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the AI client
const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Fetch news from NewsAPI
exports.getNews = async (req, res) => {
  try {
    const { locale, language, published_on } = req.query;

    const response = await axios.get(API_URL, {
      params: {
        api_token: API_KEY,
        locale: locale || "us",
        language: language || "en",
        published_on: published_on || ""
      }
    });

    const articles = response.data.data || [];
    res.render("news", { articles });
  } catch (error) {
    console.error("Error fetching news:", error.message);
    res.render("error", { message: "Could not fetch news. Try again later." });
  }
};

// Generate AI-powered analysis for a given article
exports.getAnalysis = async (req, res) => {
  try {
    const { title, snippet } = req.body;
    const prompt = `Provide a concise, reader-friendly analysis of the following news article:\n\nTitle: ${title}\n\nSnippet: ${snippet}`;

    // Use Gemini 2.5 Flash model
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);

    res.json({ analysis: result.response.text() });
  } catch (error) {
    console.error("Error generating analysis:", error.message);
    res.status(500).json({ error: "Failed to generate analysis" });
  }
};

// Render analysis page and fetch AI result client-side
exports.renderAnalysisPage = (req, res) => {
  try {
    const { title = "", snippet = "" } = req.query;
    if (!title) {
      return res.render("error", { message: "Missing article title for analysis." });
    }
    res.render("analysis", { title, snippet });
  } catch (error) {
    console.error("Error rendering analysis page:", error.message);
    res.render("error", { message: "Could not open analysis page." });
  }
};