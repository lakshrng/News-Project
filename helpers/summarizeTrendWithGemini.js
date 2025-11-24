/**
 * Summarize trending topic interest data with Google Gemini AI
 * Creates short, clean news summaries from Google Trends interest_over_time data
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const CHUNK_SIZE = 5;

function formatInterestData(interestData) {
  if (interestData && typeof interestData === "object") {
    if (Array.isArray(interestData)) {
      return JSON.stringify(interestData.slice(0, 10));
    }
    if (interestData.default && Array.isArray(interestData.default.timelineData)) {
      const timeline = interestData.default.timelineData.slice(-10);
      return timeline
        .map((point) => ({
          date: point.formattedTime || point.time,
          value: point.value?.[0] || point.formattedValue || "N/A",
        }))
        .map((p) => `${p.date}: ${p.value}`)
        .join("\n");
    }
    return JSON.stringify(interestData).substring(0, 500);
  }
  return "Interest data not available";
}

function chunkArray(arr = [], size = 5) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function summarizeTrendChunk(chunk, apiKey) {
  if (!apiKey) {
    throw new Error("Google Gemini API key is required");
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const formattedTopics = chunk.map((entry, index) => ({
    order: index + 1,
    topic: entry.topic,
    interest: formatInterestData(entry.interestData),
  }));

  const prompt = `You are a professional news editor. Summarize each trending topic below using the provided Google Trends interest data.
For every topic write 2 sentences (max 60 words) explaining what is happening and why people care.
Keep the summaries in the exact same order as the input.

Input topics:
${JSON.stringify(formattedTopics, null, 2)}

Respond ONLY with valid JSON:
[
  {
    "order": 1,
    "topic": "Exact topic name",
    "summary": "Two sentence summary."
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text() || "";
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array in Gemini response");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error("Error summarizing with Gemini:", error);
    return [];
  }
}

async function summarizeTrendsWithGemini(trendsWithData, apiKey) {
  const results = [];
  const chunks = chunkArray(trendsWithData, CHUNK_SIZE);

  for (const chunk of chunks) {
    const chunkResponse = await summarizeTrendChunk(chunk, apiKey);

    chunk.forEach((entry, index) => {
      const match =
        chunkResponse.find(
          (item) =>
            item.topic?.toLowerCase() === entry.topic.toLowerCase() ||
            item.order === index + 1
        ) || {};

      results.push({
        topic: entry.topic,
        summary:
          (match.summary || "").trim() ||
          "This topic is currently trending and generating significant public interest.",
        timestamp: new Date().toISOString(),
        error: !match.summary,
      });
    });

    if (chunks.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  return results;
}

export { summarizeTrendsWithGemini };

