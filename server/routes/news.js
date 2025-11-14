const express = require("express");
const router = express.Router();
const { getNews, getAnalysis, renderAnalysisPage } = require("../controllers/newsController");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/news", getNews);
router.post("/analysis", express.json(), getAnalysis);
router.get("/analysis", renderAnalysisPage);

module.exports = router;


