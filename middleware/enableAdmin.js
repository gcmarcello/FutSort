const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    const jwtToken = req.header("token");

    // If no token, continue to next middleware
    if (!jwtToken) {
      return next();
    }

    // If token is found, verify it and set req.user
    const payload = jwt.verify(jwtToken, `${process.env.JWT_KEY}`);
    req.user = payload.user;

    // Continue to next middleware
    next();
  } catch (err) {
    next();
  }
};
