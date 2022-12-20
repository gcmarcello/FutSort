console.clear();
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const port = process.env.PORT || 5000;

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

/* React Routes */
// Serve react files
app.use(express.static(path.join(__dirname, "client/build")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("/dashboard", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

app.listen(port, () => {
  console.log(
    `\n----------------------------------------------------------------\nServer running on port ${port}...\n----------------------------------------------------------------\n`
  );
});
