const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
require("dotenv").config();
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new SpotifyStrategy({
  clientID: client_id,
  clientSecret: client_secret,
  callbackURL: "http://localhost:8080/auth/spotify/callback"
},
function(accessToken, refreshToken, profile, done) {
  return done(null, profile);
}
));