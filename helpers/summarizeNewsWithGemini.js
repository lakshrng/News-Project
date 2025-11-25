/**
 * Summarize SerpAPI Google News articles with Google Gemini.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const CHUNK_SIZE = 5;
// Make grounding optional - set ENABLE_GROUNDING=true in env to enable
const ENABLE_GROUNDING = process.env.ENABLE_GROUNDING === 'true';
const GROUNDED_TOOLS = ENABLE_GROUNDING ? [
  {
    googleSearch: {},
  },
] : undefined;

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

  // Simplified prompt - grounding is optional to avoid timeouts
  const prompt = ENABLE_GROUNDING 
    ? `You will receive up to ${chunk.length} Google News results as JSON.
For each story, write 3-4 sentences (80-120 words total) that explain the key development and why it matters for Indian readers.
You can optionally use google_search if you need additional context, but it's not mandatory.
Keep the order identical to the input.

Input articles:
${JSON.stringify(chunkPayload, null, 2)}

Respond ONLY with valid JSON in this shape (no extra text, code fences, or commentary):
[
  {
    "order": 1,
    "summary": "Three to four sentence summary here."
  }
]`
    : `You will receive up to ${chunk.length} Google News results as JSON.
For each story, write 3-4 sentences (80-120 words total) that explain the key development and why it matters for Indian readers.
Keep the order identical to the input.

Input articles:
${JSON.stringify(chunkPayload, null, 2)}

Respond ONLY with valid JSON in this shape (no extra text, code fences, or commentary):
[
  {
    "order": 1,
    "summary": "Three to four sentence summary here."
  }
]`;

  try {
    // Add timeout wrapper (20 seconds for faster fallback)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Gemini API timeout after 20 seconds")), 20000);
    });

    const generateOptions = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    // Only add tools if grounding is enabled
    if (GROUNDED_TOOLS) {
      generateOptions.tools = GROUNDED_TOOLS;
    }

    const apiPromise = model.generateContent(generateOptions);

    const result = await Promise.race([apiPromise, timeoutPromise]);
    const response = result.response.text() || "";
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array in Gemini response");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error("Gemini news summary error:", error.message);
    // Return empty array - caller will use original snippets
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
  if (!articles || articles.length === 0) {
    return [];
  }

  const summaries = [];
  const chunks = chunkArray(articles, CHUNK_SIZE);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    let chunkResponse = [];
    
    try {
      chunkResponse = await summarizeNewsChunk(chunk, apiKey);
    } catch (error) {
      console.error(`Error summarizing chunk ${i + 1}:`, error.message);
      // Continue with empty response - will use original snippets
    }

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
    if (i < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return summaries;
}

export { summarizeNewsArticles };


