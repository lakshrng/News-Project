/**
 * Summarize trending topic interest data with Google Gemini AI
 * Creates short, clean news summaries from Google Trends interest_over_time data
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Summarize a trending topic with its interest data
 * @param {string} topic - The trending topic
 * @param {Object} interestData - Interest over time data from Google Trends
 * @param {string} apiKey - Google Gemini API key
 * @returns {Promise<string>} Short news summary
 */
async function summarizeTrendWithGemini(topic, interestData, apiKey) {
  if (!apiKey) {
    throw new Error("Google Gemini API key is required");
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Format interest data for the prompt
  let interestText = "Interest data not available";
  if (interestData && typeof interestData === 'object') {
    if (Array.isArray(interestData)) {
      interestText = JSON.stringify(interestData.slice(0, 10)); // Limit to recent data
    } else if (interestData.default && Array.isArray(interestData.default.timelineData)) {
      const timeline = interestData.default.timelineData.slice(-10); // Last 10 data points
      interestText = timeline.map(point => ({
        date: point.formattedTime || point.time,
        value: point.value?.[0] || point.formattedValue || 'N/A'
      })).map(p => `${p.date}: ${p.value}`).join('\n');
    } else {
      interestText = JSON.stringify(interestData).substring(0, 500);
    }
  }

  const prompt = `You are a news writer. Based on the following trending topic and its Google Trends interest data, create a short, clean news summary (2-3 sentences maximum).

Trending Topic: ${topic}

Interest Over Time Data:
${interestText}

Create a concise, informative summary that:
- Explains why this topic is trending
- Provides context about the trend
- Is written in a professional, news-style tone
- Is exactly 2-3 sentences
- Does not include the topic name in the summary (it will be displayed separately)

Return ONLY the summary text, no additional formatting or labels.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean up the response
    return response.trim().replace(/^Summary:\s*/i, '').replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Error summarizing with Gemini:", error);
    
    // Fallback summary
    return `This topic is currently trending and generating significant interest. The trend reflects current public attention and engagement with this subject matter.`;
  }
}

/**
 * Process multiple trends with their interest data
 * @param {Array<Object>} trendsWithData - Array of {topic, interestData} objects
 * @param {string} apiKey - Google Gemini API key
 * @returns {Promise<Array>} Array of {topic, summary} objects
 */
async function summarizeTrendsWithGemini(trendsWithData, apiKey) {
  const results = [];

  for (const { topic, interestData } of trendsWithData) {
    try {
      console.log(`Summarizing trend: ${topic}...`);
      const summary = await summarizeTrendWithGemini(topic, interestData, apiKey);
      results.push({
        topic,
        summary,
        timestamp: new Date().toISOString()
      });
      
      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error summarizing trend "${topic}":`, error.message);
      results.push({
        topic,
        summary: `This topic is currently trending and generating significant public interest.`,
        timestamp: new Date().toISOString(),
        error: true
      });
    }
  }

  return results;
}

export {
  summarizeTrendWithGemini,
  summarizeTrendsWithGemini,
};

