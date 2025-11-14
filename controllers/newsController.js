const fetchSerpApiByCategories = require("../helpers/fetchSerpApiByCategories");
exports.getNews = async (req, res) => {
  try {
    let articlesByCategory = null;
    let marqueeItems = [];
    let articles = [];

    try {
      // Try SerpAPI for categorized news
      articlesByCategory = await fetchSerpApiByCategories();

      if (articlesByCategory) {
        // Limit each category to 5 articles
        Object.keys(articlesByCategory).forEach(cat => {
          articlesByCategory[cat] = articlesByCategory[cat]?.slice(0, 5) || [];
        });

        return res.render("news", {
          articlesByCategory
        });
      }
    } catch (e) {
      console.warn("⚠️ SerpAPI fetch failed:", e?.message || e);
    }

    // If no data or API failed, render empty structure
    const emptyCategories = {
      latest: [],
      politics: [],
      sports: [],
      business: [],
      science: []
    };

    return res.render("news", {
      articles: [],
      articlesByCategory: emptyCategories,
      marqueeItems: []
    });

  } catch (error) {
    console.error("❌ Error generating AI news:", error.message);
    res.status(500).render("error", { message: "Could not generate AI news." });
  }
};

exports.getAnalysis = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text for analysis" });
    }

    // Placeholder for AI analysis logic
    const analysisResult = {
      sentiment: "positive",
      summary: "The news article is generally optimistic about recent developments.",
      keywords: ["innovation", "growth", "technology"]
    };

    res.json({ analysis: analysisResult });
  } catch (error) {
    console.error("❌ Error in analysis:", error.message);
    res.status(500).json({ error: "Analysis failed" });
  }
};

exports.renderAnalysisPage = (req, res) => {
  const { title = "", snippet = "", image_url = "" } = req.query;
  res.render("analysis", { title, snippet, image_url });
};


module.exports = {
  getNews: exports.getNews,
  getAnalysis: exports.getAnalysis,
  renderAnalysisPage: exports.renderAnalysisPage
};
