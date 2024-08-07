const express = require("express");
const app = express();
require("dotenv").config();
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const cors = require("cors");
const PORT = process.env.PORT || 5050;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const client_url = process.env.CLIENT_URL;
const passport = require('passport');
require('./passport')
const SpotifyStrategy = require('passport-spotify').Strategy;
const { CORS_ORIGIN } = process.env;

app.use(cors( { origin: CORS_ORIGIN } ));

app.options('*', cors({
  origin: CORS_ORIGIN,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

app.use(express.json());
// test

//SPOTIFY OAUTH IMPLEMENTATION TBD
passport.use(
  new SpotifyStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: `${client_url}/home`
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

app.get('/api', (req, res) => {
  res.send('Welcome to the API of the Hit Me app!');
});

app.use('/api/users', userRoutes);

app.use('/api/artists', commentRoutes);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));