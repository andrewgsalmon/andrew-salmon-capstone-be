const express = require("express");
const app = express();
require("dotenv").config();
require('./middleware/passport')
const cors = require("cors");
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const authRoutes = require('./routes/authRoutes');
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

app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));