var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_PROJECT_CLIENT_ID, // ClientID
  process.env.GOOGLE_PROJECT_SECRET, // Client Secret
  "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_AUTH0_REFRESH_TOKEN,
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
