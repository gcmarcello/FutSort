var nodemailer = require("nodemailer");

const passwordRecoveryTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_RESET_PW_EMAIL_EMAIL,
    pass: process.env.NODEMAILER_RESET_PW_EMAIL_PASSWORD,
  },
});

exports.passwordRecoveryTransporter = passwordRecoveryTransporter;
