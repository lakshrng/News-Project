const axios = require("axios");
const { API_URL, API_KEY } = require("../config/config");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require('../config/env');

const ai = env.GOOGLE_API_KEY && env.GOOGLE_API_KEY !== 'your-google-ai-api-key-here' 
  ? new GoogleGenerativeAI(env.GOOGLE_API_KEY) 
  : null;

async function getNewsJson(req, res) {
  try {
    const { locale, language, published_on } = req.query;
    console.log("API_KEY:", API_KEY ? "Set" : "Not set");
    console.log("API_URL:", API_URL);
    
    const response = await axios.get(API_URL, {
      params: {
        api_token: API_KEY,
        locale: locale || "us",
        language: language || "en",
        published_on: published_on || ""
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
  } catch (err) {
    console.error("/api/news error:", err.message);
    console.error("Error details:", err.response?.data);
    res.status(500).json({ articles: [] });
  }
}

async function getAnalysisJson(req, res) {
  try {
    const { title = "", snippet = "" } = req.body || {};
    if (!title) {
      return res.status(400).json({ error: "Missing title" });
    }

    if (ai) {
      const prompt = `Provide a concise, reader-friendly analysis of the following news article. Use  paragraphs and bullet points when helpful.\n\nTitle: ${title}\n\nSnippet: ${snippet} get news anaylysis from different sourcrs and mention sources of news. in side with small hyperlinks.`;
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.() || "";
      res.json({ analysis: text });
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
  } catch (err) {
    console.error("/api/analysis error:", err.message);
    res.status(500).json({ analysis: "" });
  }
}

module.exports = { getNewsJson, getAnalysisJson };


