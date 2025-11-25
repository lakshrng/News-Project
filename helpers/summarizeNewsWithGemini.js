/**
 * Summarize SerpAPI Google News articles with Google Gemini.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const CHUNK_SIZE = 5;
const GROUNDED_TOOLS = [
  {
    googleSearch: {},
  },
];

function chunkArray(arr = [], size = 5) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function summarizeNewsChunk(chunk, apiKey) {
  if (!apiKey) {
    throw new Error("Google Gemini API key is required");
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const chunkPayload = chunk.map((article, index) => ({
    order: index + 1,
    title: article.title || `Untitled story ${index + 1}`,
    snippet:
      article.snippet ||
      "No snippet provided. Focus on why the headline matters for readers in India.",
    source: article.source || "Unknown source",
    date: article.date || article.published_at || "Unknown time",
  }));

  const prompt = `You will receive up to ${chunk.length} Google News results as JSON.
For each story, write EXACTLY 4 sentences (80-120 words total) that explain the key development and why it matters for Indian readers.
Before drafting the summary for a story, you MUST call google_search with the story title (or the most relevant keywords) to retrieve fresh context specific to that story.
Use ONLY the google_search results you just fetched for that story and cite at least one fetched source inline (e.g., "— Source: BBC"). Summaries without a citation are invalid.
Keep the order identical to the input.

Input articles:
${JSON.stringify(chunkPayload, null, 2)}

Respond ONLY with valid JSON in this shape (no extra text, code fences, or commentary):
[
  {
    "order": 1,
    "summary": "Four-sentence summary here."
  }
]`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      tools: GROUNDED_TOOLS,
    });
    const response = result.response.text() || "";
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array in Gemini response");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error("Gemini news summary error:", error);
    // Fallback: return empty array, caller will handle defaults.
    return [];
  }
}

/**
 * Summarize a list of SerpAPI news articles (batched to reduce API calls).
 * @param {Array<Object>} articles
 * @param {string} apiKey
 * @returns {Promise<Array<Object>>}
 */
async function summarizeNewsArticles(articles = [], apiKey) {
  const summaries = [];
  const chunks = chunkArray(articles, CHUNK_SIZE);

  for (const chunk of chunks) {
    const chunkResponse = await summarizeNewsChunk(chunk, apiKey);

    chunk.forEach((article, index) => {
      const matchingSummary =
        chunkResponse.find((item) => item.order === index + 1)?.summary ||
        article.snippet ||
        "This story is developing.";

      summaries.push({
        title: article.title,
        snippet: article.snippet,
        summary: matchingSummary.trim(),
        source: article.source || "Google News",
        url: article.link || article.url,
        link: article.link || article.url,
        image_url: article.thumbnail || article.image_url || null,
        published_at: article.date || article.published_at || null,
      });
    });

    // Small pause between chunk requests to respect rate limits.
    if (chunks.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  return summaries;
}

export { summarizeNewsArticles };


