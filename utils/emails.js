var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  "849583867779-cqcsr0sa0qhu165kp7gvdpkr2hes7put.apps.googleusercontent.com", // ClientID
  "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", // Client Secret
  "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: "1//04NhGMExh5N1ZCgYIARAAGAQSNgF-L9IrrnjmLWVG5sZtyrJY9FnV2StHEhfyQ8GIzmOgK8A3vgK2kTD8JxTie_qtQUjDQiBhjA",
});
const accessToken = oauth2Client.getAccessToken();

const passwordRecoveryTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.NODEMAILER_RESET_PW_EMAIL_EMAIL,
    clientId: process.env.GOOGLE_PROJECT_CLIENT_ID,
    clientSecret: process.env.GOOGLE_PROJECT_SECRET,
    refreshToken: process.env.GOOGLE_AUTH0_REFRESH_TOKEN,
    accessToken: accessToken,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.passwordRecoveryTransporter = passwordRecoveryTransporter;
