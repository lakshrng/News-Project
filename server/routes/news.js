  const express = require("express");
  const router = express.Router();
  const { getNews, getAnalysis, renderAnalysisPage } = require("../controllers/newsController");

  router.get("/", (req, res) => {
    res.render("index");
  });

<<<<<<< HEAD:server/routes/news.js
router.get("/news", getNews);
router.post("/analysis", express.json(), getAnalysis);
router.get("/analysis", renderAnalysisPage);

module.exports = router;


=======
  router.get("/news", (req, res) => res.redirect("/"));
  router.post("/news", getNews);

  // New POST route for AI analysis
  router.post("/analysis", express.json(), getAnalysis);

  // View analysis page (client-side fetch to POST /analysis)
  router.get("/analysis", renderAnalysisPage);

  module.exports = router;
>>>>>>> 4f70c6083a8db5fb99a3dcd7842bce38f7bdff11:routes/news.js
