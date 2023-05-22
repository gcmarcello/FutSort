const pool = require("../db");

module.exports = async (req, res, next) => {
  const { email, name, password } = req.body;

  function validName(userName) {
    return /^[a-zA-Z0-9_-]{3,16}$/.test(userName);
  }

  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }

  function validPassword(userPassword) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%#*?&]{8,}$/.test(userPassword);
  }

  if (req.path === "/register") {
    if (![email, name, password].every(Boolean)) {
      return res.status(400).json("Alguns campos estão vazios.");
    } else if (!validName(name)) {
      return res.status(400).json("Usuário inválido. Apenas letras, números e underlines são permitidos. (3-16 caracteres)");
    } else if (!validEmail(email)) {
      return res.status(400).json("Email inválido.");
    } else if (!validPassword(password)) {
      return res.status(400).json("Senha inválida.");
    }

    const usernameCheck = await pool.query("SELECT * FROM users WHERE user_name = $1", [name]);
    const emailCheck = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

    if (usernameCheck.rows.length !== 0) {
      return res.status(400).json("Usuário já registrado.");
    }

    if (emailCheck.rows.length !== 0) {
      return res.status(400).json("Email já registrado.");
    }
  }

  if (req.path === "/login") {
    if (![name, password].every(Boolean)) {
      return res.status(400).json("Senha ou usuário estão vazios.");
    }
  }

  if (req.path === "/senha/redefinir/*") {
    if (![name, password].every(Boolean)) {
      return res.status(400).json("Senha ou usuário estão vazios.");
    } else if (!validPassword(password)) {
      return res.status(400).json("Senha inválida.");
    }
  }

  next();
};
