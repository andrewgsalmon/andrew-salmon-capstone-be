const express = require("express");
const app = express();
// const recosRoutes = require("./routes/recos");
// const tokenRoutes = require("./routes/spotifyToken.js")
const userRoutes = require('./routes/userRoutes');
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 5050;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const client_url = process.env.CLIENT_URL;
const passport = require('passport');
require('./passport')
const SpotifyStrategy = require('passport-spotify').Strategy;
const cookieSession = require('cookie-session')
const { CORS_ORIGIN } = process.env;

app.use(cors());

app.use(express.json());

// app.use(cookieSession({
//   name: 'spotify-auth-session',
//   keys: ['key1', 'key2']
// }))

passport.use(
  new SpotifyStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: 'http://localhost:8080/auth/spotify/callback'
    },
    function(accessToken, refreshToken, expires_in, profile, done) {
      User.findOrCreate({ spotifyId: profile.id }, function(err, user) {
        return done(err, user);
      });
    }
  )
);

app.get('/auth/spotify', passport.authenticate('spotify', {
  scope: ['user-read-email', 'user-read-private']
}));

app.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect(`${client_url}/home`);
  }
);

// app.use("/videos", express.static("./public/images"));

// app.use('/spotify', spotifyToken);

app.get('/', (req, res) => {
  res.send('Welcome to my API');
});

app.use('/api/users', userRoutes);

// app.use("/api/recos", recosRoutes);

// app.use("/token", tokenRoutes);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));