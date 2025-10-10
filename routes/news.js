  const express = require("express");
  const router = express.Router();
  const { getNews, getAnalysis, renderAnalysisPage } = require("../controllers/newsController");

  router.get("/", (req, res) => {
    res.render("index");
  });

  router.get("/news", (req, res) => res.redirect("/"));
  router.post("/news", getNews);

  // New POST route for AI analysis
  router.post("/analysis", express.json(), getAnalysis);

  // View analysis page (client-side fetch to POST /analysis)
  router.get("/analysis", renderAnalysisPage);

  module.exports = router;
