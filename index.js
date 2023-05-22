console.clear();
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const port = process.env.PORT || 5000;

if (process.env.NODE_ENV === "production") {
  function requireHTTPS(req, res, next) {
    // The 'x-forwarded-proto' check is for Heroku
    if (!req.secure && req.get("x-forwarded-proto") !== "https" && process.env.NODE_ENV !== "development") {
      return res.redirect("https://" + req.get("host") + req.url);
    }
    next();
  }
  app.use(requireHTTPS);
}

/* Middlewares */
app.use(express.json());
app.use(cors());

/* API Routes */
// Auth Routes
app.use("/api/auth", require("./routes/auth"));
// Group Routes
app.use("/api/group", require("./routes/group"));
// Player Routes
app.use("/api/player", require("./routes/player"));
// Match Routes
app.use("/api/match", require("./routes/match"));
// Request Routes
app.use("/api/request", require("./routes/request"));
// Seasons Routes
app.use("/api/season", require("./routes/season"));
// Password Routes
app.use("/api/password", require("./routes/password"));

/* React Routes */
const buildPath = path.join(__dirname, "client/build");

if (process.env.NODE_ENV === "development") {
  app.get(/^\/static\/js\/main\.[a-f0-9]{8}\.js\.map$/, (req, res) => {
    const fileName = req.url.slice(1);
    res.sendFile(path.join(buildPath, fileName));
  });
  app.get(/^\/static\/css\/main\.[a-f0-9]{8}\.css\.map$/, (req, res) => {
    const fileName = req.url.slice(1);
    res.sendFile(path.join(buildPath, fileName));
  });
}

app.get(/^\/static\/js\/main\.[a-f0-9]{8}\.js$/, (req, res) => {
  const fileName = req.url.slice(1);
  res.sendFile(path.join(buildPath, fileName));
});
app.get(/^\/static\/css\/main\.[a-f0-9]{8}\.css$/, (req, res) => {
  const fileName = req.url.slice(1);
  res.sendFile(path.join(buildPath, fileName));
});

process.env.NODE_ENV === "production" &&
  app.get("/**", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });

app.listen(port, () => {
  console.log(
    `\n----------------------------------------------------------------\nServer running on port ${port}...\n----------------------------------------------------------------\n`
  );
});
