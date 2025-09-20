const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const newsRoutes = require("./routes/news");

dotenv.config();
const app = express();

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", newsRoutes);

// Error page
app.use((req, res) => {
  res.status(404).render("error", { message: "Page not found!" });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
