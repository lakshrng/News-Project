const axios = require("axios");
const { API_URL, API_KEY } = require("../config/config");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require('../config/env');

// Initialize the AI client
const ai = env.GOOGLE_API_KEY && env.GOOGLE_API_KEY !== 'your-google-ai-api-key-here' 
  ? new GoogleGenerativeAI(env.GOOGLE_API_KEY) 
  : null;

// Fetch news and render EJS page
exports.getNews = async (req, res) => {
  try {
    const { locale, language, published_on } = req.query;
    console.log("Fetching news with API_KEY:", API_KEY ? "Set" : "Not set");
    console.log("API_URL:", API_URL);
    
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
    console.error("Error details:", error.response?.data);
    res.render("error", { message: "Could not fetch news. Try again later." });
  }
};

// Generate AI-powered analysis for a given article (server-rendered flow)
exports.getAnalysis = async (req, res) => {
  try {
    const { title, snippet } = req.body || {};
    
    if (ai) {
      const prompt = `Provide a concise, reader-friendly analysis of the following news article:\n\nTitle: ${title}\n\nSnippet: ${snippet} from different news channels. and mention sources of news. in side with small hyperlinks.`;
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      res.json({ analysis: result.response.text() });
    } else {
      // Fallback analysis when AI is not available
      const fallbackAnalysis = `
        <h3>Analysis: ${title}</h3>
        <p><strong>Article Summary:</strong> ${snippet}</p>
        
        <h4>Key Points:</h4>
        <ul>
          <li>This article discusses important developments in the news</li>
          <li>The topic appears to be significant and worth monitoring</li>
          <li>Further research and analysis would be beneficial</li>
        </ul>
        
        <h4>Context:</h4>
        <p>This news item represents an important development that requires attention. The implications of this story extend beyond the immediate details and may have broader significance.</p>
        
        <h4>Sources:</h4>
        <p>For more detailed analysis and additional sources, please refer to:</p>
        <ul>
          <li><a href="#" target="_blank">Primary News Source</a></li>
          <li><a href="#" target="_blank">Related Coverage</a></li>
          <li><a href="#" target="_blank">Expert Analysis</a></li>
        </ul>
        
        <p><em>Note: This is a template analysis. For AI-powered analysis, please configure the Google AI API key.</em></p>
      `;
      res.json({ analysis: fallbackAnalysis });
    }
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


