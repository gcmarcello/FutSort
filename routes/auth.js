const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const verifyCaptcha = require("../middleware/verifyCaptcha");
const authorization = require("../middleware/Authorization");

require("dotenv").config();

// Register Route
router.post("/register", [verifyCaptcha, validInfo], async (req, res) => {
  const { captchaToken, name, email, password } = req.body;
  try {
    // Encrypting password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // Inserting user into DB
    const newUser = await pool.query("INSERT INTO users (user_name, user_email, user_password) VALUES ($1,$2,$3) RETURNING *", [
      name,
      email,
      bcryptPassword,
    ]);

    //JWT
    const token = jwtGenerator(newUser.rows[0].user_id, newUser.rows[0].user_name);
    res.json({ token });
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

// Login Route
router.post("/login", validInfo, async (req, res) => {
  const { name, password } = req.body;

  // DB Query
  const user = await pool.query("SELECT * FROM users WHERE user_name = $1", [name]);

  // Checks if user was found in query
  if (user.rows.length === 0) {
    return res.status(401).json("Usuário ou senha estão incorretos!");
  }

  // Comparing password hashes
  const validPassword = await bcrypt.compare(password, user.rows[0].user_password);
  if (!validPassword) {
    return res.status(401).json("Usuário ou senha estão incorretos!");
  }

  //JWT
  const token = jwtGenerator(user.rows[0].user_id, user.rows[0].user_name);
  res.json({ name, password, token });
});

// Authentication Route
router.get("/authentication", authorization, async (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    res.status(500).json("Server Error");
  }
});

// Get Profile
router.get("/getprofile", authorization, async (req, res) => {
  try {
    const user = await pool.query("SELECT user_name FROM users AS u WHERE u.user_id = $1", [req.user]);
    res.json(user.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
