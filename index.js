const express = require("express");
const app = express();
require("dotenv").config();
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('./middleware/passport')
const cors = require("cors");
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
// const spotifyRoutes = require('./routes/spotifyRoutes');
// const client_id = process.env.CLIENT_ID;
// const client_secret = process.env.CLIENT_SECRET;
// const client_url = process.env.CLIENT_URL;
// const SpotifyStrategy = require('passport-spotify').Strategy;
const PORT = process.env.PORT || 5050;
const { CORS_ORIGIN, CLIENT_URL, JWT_KEY } = process.env;

// const isLoggedIn = (req, res, next) => {
//   req.user ? next() : res.sendStatus(401);
// }

app.use(express.json());

app.use(cors( { origin: CORS_ORIGIN } ));

app.options('*', cors({
  origin: CORS_ORIGIN,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

app.use(passport.initialize());

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/auth/google/failure'
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      JWT_KEY,
      { expiresIn: "24h" }
    );
    res.redirect(`${CLIENT_URL}/login?token=${token}`);
  }
);

app.get('/auth/google/failure', (req, res) => {
  res.send('Something went wrong!')
})

app.get('/api', (req, res) => {
  res.send('Welcome to the API of the Hit Me app!');
});

app.use('/api/users', userRoutes);

app.use('/api/artists', commentRoutes);

// app.use('/api/spotify', spotifyRoutes);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));