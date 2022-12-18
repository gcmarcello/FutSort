module.exports = (req, res, next) => {
  const { email, name, password } = req.body;

  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }

  if (req.path === "/register") {
    if (![email, name, password].every(Boolean)) {
      return res.status(401).json("Senha ou usuário estão vazios.");
    } else if (!validEmail(email)) {
      return res.status(401).json("Invalid Email");
    }
  } else if (req.path === "/login") {
    if (![name, password].every(Boolean)) {
      return res.json("Senha ou usuário estão vazios.");
    } /* else if (!validEmail(name)) {
      return res.json("Invalid Username");
    } */
  }

  next();
};
