console.clear();
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const port = process.env.PORT || 5000;

function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (
    !req.secure &&
    req.get("x-forwarded-proto") !== "https" &&
    process.env.NODE_ENV !== "development"
  ) {
    return res.redirect("https://" + req.get("host") + req.url);
  }
  next();
}

/* Middlewares */
app.use(requireHTTPS);
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

/* React Routes */
// Serve react files
app.use(express.static(path.join(__dirname, "client/build")));
// Home Page
app.use("/", express.static(path.join(__dirname, "client/build")));
// Register
app.use("/register", express.static(path.join(__dirname, "client/build")));
// Dashboard
app.use("/dashboard", express.static(path.join(__dirname, "client/build")));
// Edit Matches
app.use("/editmatch/*", express.static(path.join(__dirname, "client/build")));
// View Matches
app.use("/viewmatch/*", express.static(path.join(__dirname, "client/build")));

app.listen(port, () => {
  console.log(
    `\n----------------------------------------------------------------\nServer running on port ${port}...\n----------------------------------------------------------------\n`
  );
});
