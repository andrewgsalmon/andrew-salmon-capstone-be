const express = require("express");
const app = express();
require("dotenv").config();
require('./middleware/passport')
const cors = require("cors");
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const authRoutes = require('./routes/authRoutes');
// const spotifyRoutes = require('./routes/spotifyRoutes');
// const client_id = process.env.CLIENT_ID;
// const client_secret = process.env.CLIENT_SECRET;
// const client_url = process.env.CLIENT_URL;
// const SpotifyStrategy = require('passport-spotify').Strategy;
const PORT = process.env.PORT || 5050;
const { CORS_ORIGIN } = process.env;

app.use(express.json());

app.use(cors( { origin: CORS_ORIGIN } ));

app.options('*', cors({
  origin: CORS_ORIGIN,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

app.get('/api', (req, res) => {
  res.send('Welcome to the API of the Hit Me app!');
});

app.use('/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/artists', commentRoutes);

// app.use('/api/spotify', spotifyRoutes);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));