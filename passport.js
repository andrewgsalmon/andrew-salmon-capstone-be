// SPOTIFY OAUTH IMPLEMENTATION TBD

const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
require("dotenv").config();
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const client_url = process.env.CLIENT_URL;

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new SpotifyStrategy({
  clientID: client_id,
  clientSecret: client_secret,
  callbackURL: `${client_url}/auth/spotify/callback`
},
function(accessToken, refreshToken, profile, done) {
  return done(null, profile);
}
));