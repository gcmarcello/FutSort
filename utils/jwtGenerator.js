const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(userId, userName) {
  const payload = {
    user: userId,
    userName: userName,
  };

  const expiration = process.env.NODE_ENV === "production" ? "3hr" : "1000hr";

  return jwt.sign(payload, process.env.JWT_KEY, { expiresIn: expiration });
}

module.exports = jwtGenerator;
