const { verify } = require("hcaptcha");

module.exports = async (req, res, next) => {
  const { captchaToken } = req.body;
  const verifyCaptcha = await verify(
    process.env.NODE_ENV === "production" ? process.env.NODE_HCAPTCHA_SECRET : "0x0000000000000000000000000000000000000000",
    captchaToken
  );
  if (verifyCaptcha.success != true) {
    return res.status(400).json("Por favor, verifique o Captcha.");
  }
  next();
};
