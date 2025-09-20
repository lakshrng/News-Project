require("dotenv").config();

module.exports = {
  API_URL: "https://api.thenewsapi.com/v1/news/top",  // <-- example endpoint
  API_KEY: process.env.NEWS_API_TOKEN
};
