/**
 * Process news articles with Google Gemini AI
 * Generates comprehensive news articles based on multiple sources
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Process multiple news articles for a trend and generate a comprehensive article
 * @param {string} trend - The trending topic
 * @param {Array<Object>} articles - Array of news articles with title, snippet, link
 * @param {string} apiKey - Google Gemini API key
 * @returns {Promise<Object>} Generated article data with title, content, summary, tags
 */
async function processArticlesWithGemini(trend, articles, apiKey) {
  if (!apiKey) {
    throw new Error("Google Gemini API key is required");
  }

  if (!articles || articles.length === 0) {
    throw new Error("At least one article is required");
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Format articles for the prompt
  const articlesText = articles
    .map((article, index) => {
      return `Article ${index + 1}:
Title: ${article.title}
Summary: ${article.snippet || "No summary available"}
Source: ${article.source || "Unknown"}
Link: ${article.link || ""}`;
    })
    .join("\n\n");

  const prompt = `You are a professional news writer. Based on the following trending topic and multiple news articles, create a comprehensive, well-researched news article.

Trending Topic: ${trend}

Source Articles:
${articlesText}

Create a comprehensive news article that:
- Synthesizes information from all the provided articles
- Provides a well-structured, compelling headline
- Is informative, factual, and balanced
- Is 500-800 words long
- Includes a brief summary (2-3 sentences)
- Uses a professional and engaging tone
- Includes relevant details and context from multiple sources
- Ends with a thoughtful conclusion
- Identifies the most relevant category (Technology, Business, Politics, Health, Sports, Entertainment, Science, General)
- Suggests appropriate tags

Format the response as JSON with the following structure:
{
  "title": "Article title here",
  "content": "Full article content here (500-800 words)",
  "summary": "Brief summary here (2-3 sentences)",
  "category": "Most relevant category",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}

Ensure the JSON is valid and properly formatted.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }

    const articleData = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!articleData.title || !articleData.content || !articleData.summary) {
      throw new Error("Incomplete article data from Gemini");
    }

    return {
      title: articleData.title,
      content: articleData.content,
      summary: articleData.summary,
      category: articleData.category || "General",
      tags: articleData.tags || [trend.toLowerCase().replace(/\s+/g, "-"), "trending"],
    };
  } catch (error) {
    console.error("Error processing with Gemini:", error);
    
    // Fallback: create a basic article structure
    return {
      title: `Trending: ${trend}`,
      content: `This article covers the trending topic: ${trend}.\n\nBased on multiple sources:\n${articles.map((a, i) => `${i + 1}. ${a.title}: ${a.snippet || ""}`).join("\n")}`,
      summary: `A comprehensive overview of the trending topic: ${trend}`,
      category: "General",
      tags: [trend.toLowerCase().replace(/\s+/g, "-"), "trending"],
    };
  }
}

/**
 * Process multiple trends and their articles
 * @param {Object} trendsWithArticles - Object mapping trends to their articles
 * @param {string} apiKey - Google Gemini API key
 * @returns {Promise<Object>} Object mapping each trend to its generated article
 */
async function processTrendsWithGemini(trendsWithArticles, apiKey) {
  const results = {};

  for (const [trend, articles] of Object.entries(trendsWithArticles)) {
    if (articles.length === 0) {
      console.log(`Skipping trend "${trend}" - no articles found`);
      continue;
    }

    try {
      console.log(`Processing trend "${trend}" with Gemini...`);
      const articleData = await processArticlesWithGemini(trend, articles, apiKey);
      results[trend] = articleData;
      
      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error processing trend "${trend}" with Gemini:`, error.message);
      results[trend] = null;
    }
  }

  return results;
}

export {
  processArticlesWithGemini,
  processTrendsWithGemini,
};

