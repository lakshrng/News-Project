// gemini-test.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const axios = require("axios");

// --- CONFIG ---
const API_KEY = process.env.GOOGLE_API_KEY; // make sure this is set in your .env or shell
const MODEL = "gemini-1.5-pro-latest";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

if (!API_KEY) {
  console.error("❌ Missing GOOGLE_API_KEY in environment variables");
  process.exit(1);
}

// --- PROMPT ---
const prompt = "Write a short, fun news-style headline about AI learning to cook.";

// --- REQUEST BODY (Gemini API expects this shape) ---
const body = {
  contents: [
    {
      parts: [{ text: prompt }]
    }
  ]
};

// --- MAIN FUNCTION ---
async function run() {
  try {
    console.log("=== Gemini API Test ===");
    console.log("Request URL:", URL.replace(API_KEY, "***")); // mask key in logs
    console.log("Request Headers:", { "Content-Type": "application/json" });
    console.log("Request Body:", JSON.stringify(body, null, 2));

    const resp = await axios.post(URL, body, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("\n=== Gemini API Response ===");
    console.log("Status:", resp.status);
    console.log("Raw JSON:", JSON.stringify(resp.data, null, 2));

    // Extract text
    let text = "";
    if (resp.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = resp.data.candidates[0].content.parts[0].text;
    }

    console.log("\n=== Extracted Text ===");
    console.log(text || "(no text found)");

  } catch (err) {
    console.error("\n❌ Error calling Gemini API:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Message:", err.message);
    }
  }
}

run();
