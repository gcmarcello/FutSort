const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const verifyCaptcha = require("../middleware/verifyCaptcha");
const { passwordRecoveryTransporter } = require("../utils/emails");
const validInfo = require("../middleware/validInfo");

// Create password change request
router.post("/request", [verifyCaptcha, validInfo], async (req, res) => {
  const { email } = req.body;
  const validateEmail = await pool.query("SELECT user_email, user_id from users WHERE user_email = $1", [email]);

  if (validateEmail.rows.length > 0) {
    try {
      const expirationDate = new Date(Date.now() + 7200000); //2hrs from now
      const validUserEmail = validateEmail.rows[0].user_email;
      const userId = validateEmail.rows[0].user_id;
      const newPasswordReset = await pool.query(
        "INSERT INTO password_resets (reset_email,reset_user_id,reset_expiration) VALUES ($1,$2,$3) RETURNING *",
        [validUserEmail, userId, expirationDate]
      );

      const passwordResetId = newPasswordReset.rows[0].reset_id;
      var passwordRecoveryTransporterMail = {
        from: `"FutSort Recuperação de Senhas" ${process.env.NODEMAILER_RESET_PW_EMAIL_EMAIL}`,
        to: validUserEmail,
        subject: "FutSort - Recuperação de Senha",
        html: `<h1><strong><span style="color:#27ae60">F</span>ut<span style="color:#27ae60">S</span>ort - Redefini&ccedil;&atilde;o de Senha</strong></h1><p>Ol&aacute;,</p><p>Parece que voc&ecirc; requisitou uma redefini&ccedil;&atilde;o de senha para a sua conta no FutSort. Clique no link abaixo ou copie e cole no navegador para ter acesso a p&aacute;gina de redefini&ccedil;&atilde;o da senha.</p><p><a href="https://www.futsort.com/password/reset/${passwordResetId}">https://www.futsort.com/password/reset/${passwordResetId}</a></p><p>Lembre-se que a sua senha deve conter no m&iacute;nimo:</p><ul><li>8 Caracteres</li><li>1 Caractere ma&iacute;usculo</li><li>1 Caractere min&uacute;sculo</li><li>1 N&uacute;mero</li></ul><p>Se voc&ecirc; n&atilde;o requisitou que sua senha seja alterada, por favor desconsidere este e-mail. <strong>Este link ir&aacute; expirar em 2 horas</strong>.</p><p>Obrigado,</p><p>Administra&ccedil;&atilde;o <strong><span style="color:#27ae60">F</span>ut<span style="color:#27ae60">S</span>ort.</strong></p>`,
      };

      console.log("hi");

      passwordRecoveryTransporter.sendMail(passwordRecoveryTransporterMail, function (err, data) {
        if (err) {
          console.log(err);
          res.json({ type: "error", message: err });
        } else {
          res.json({
            type: "success",
            message:
              "Se existe uma conta registrada com esse email, você deve receber um email em instantes com as instruções para redefinir sua senha. Por favor, verifique também a caixa de spam.",
          });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("Server Error.");
    }
  }
});

router.get("/review/:requestId", async (req, res) => {
  const { requestId } = req.params;
  const now = new Date();
  const request = await pool.query("SELECT * FROM password_resets WHERE reset_id = $1", [requestId]);
  res.json(
    request.rows[0] ? (request.rows[0].reset_expiration - now > 0 ? request.rows[0] : "Solicitação expirada.") : "Solicitação não encontrada."
  );
});

router.put("/update", verifyCaptcha, async (req, res) => {
  const { password, userId, requestId } = req.body;
  try {
    const now = new Date();
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const bcryptPassword = await bcrypt.hash(password, salt);
    const updatePassword = await pool.query("UPDATE users SET user_password = $1 WHERE user_id = $2 RETURNING *", [bcryptPassword, userId]);
    const terminateRequest = await pool.query("UPDATE password_resets SET reset_expiration = $1 WHERE reset_id = $2 RETURNING *", [now, requestId]);
    const token = jwtGenerator(updatePassword.rows[0].user_id, updatePassword.rows[0].user_name);
    res.json({ token });
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
