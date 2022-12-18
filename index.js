console.clear();
const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

// Middlewares
app.use(express.json());
app.use(cors());

// Routes

//Login and Register Routes
app.use("/auth", require("./routes/jwtAuth"));

//Dashboard Route
app.use("/dashboard", require("./routes/dashboard"));

//Match Route
app.use("/match", require("./routes/match"));

app.listen(port, () => {
  console.log(
    `\n----------------------------------------------------------------\nServer running on port ${port}...\n----------------------------------------------------------------\n`
  );
});
