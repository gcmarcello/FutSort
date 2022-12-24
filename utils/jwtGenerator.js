const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(userId, userName) {
  const payload = {
    user: userId,
    userName: userName,
  };

  return jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "3hr" });
}

module.exports = jwtGenerator;
