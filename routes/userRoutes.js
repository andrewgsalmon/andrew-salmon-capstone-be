const knex = require('knex')(require('../knexfile'));
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authorize = require('../middleware/authorize');

// ## POST /api/users/register
// - Creates a new user.
router.post("/register", async (req, res) => {
  const { name, email, fav_artists, location, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("See those required fields up there? Get to work!");
  }

  // Create a hashed Password using brcrypt.hashSync(password)
  const hashedPassword = bcrypt.hashSync(password)

  // Create the new user
  const newUser = {
    name,
    fav_artists,
    location,
    email,
    password: hashedPassword //update password to use hashed password
  };

  // Insert it into our database
  try {
    await knex('users').insert(newUser);
    res.status(201).send("Registered successfully");
  } catch (error) {
    res.status(400).send(req.body);
  }
});

// ## POST /api/users/login
// -   Generates and responds a JWT for the user to use for future authorization.
// -   Expected body: { email, password }
// -   Response format: { token: "JWT_TOKEN_HERE" }
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please enter the required fields");
  }

  // Find the user using the email
  const user = await knex('users').where({ email: email }).first();
  // If theres no user return a status of 400 and send text "Invalid email"
  if (!user) {
    return res.status(400).send("Whoops... no account exists under that email!  Be sure to register above.")
  }

  // Validate the password using bcrypt.compareSync(password, user.password)
  const isPasswordCorrect = bcrypt.compareSync(password, user.password)
  // If the password is not correct then send send status of 400 with a message "Invalid Password"
  if (!isPasswordCorrect) {
    return res.status(400).send("Incorrect password! Let's try that again...")
  }
  // Generate a token with JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_KEY,
    { expiresIn: '24h' }
  )
  // Issue the user their token
  res.json({ token: token })
});


// ## GET /api/users/current
// -   Gets information about the currently logged in user.
// -   If no valid JWT is provided, this route will respond with 401 Unauthorized.
// -   Expected headers: { Authorization: "Bearer JWT_TOKEN_HERE" }
router.get("/current", async (req, res) => {
  // If there is no auth header provided
  if (!req.headers.authorization) {
    return res.status(401).send("Please login");
  }
  // console.log(req.headers.authorization);
  // Parse the bearer token

  const authHeader = req.headers.authorization;
  const authToken = authHeader.split(' ')[1];

  // create a variable that stores the authorization token
  // Create a variable to split the auth header and store the second item in the arra
  // Verify the token
  try {
    // Use jwt.verify to verify the token as compared to your JWT_KEY inside of the .env
    const decoded = jwt.verify(authToken, process.env.JWT_KEY);
    // Respond with the appropriate user data
    const user = await knex('users').where({ id: decoded.id }).first();

    // Get the user by accessing the users table and retrieving the user by decoded.id
    // dont forget to delete the password before sending back the users info
    delete user.password
    res.json(user);
  } catch (error) {
    return res.status(401).send("Invalid auth token");
  }
});


router.get("/current", authorize, async (req, res) => {

  try {
    //req.user should have {id,email}
    //could put this line below in middleware too so you have
    //actual user data in all your endpoints
    const user = await knex('users').where({ id: req.user.id }).first();
    res.json(user);
  } catch (error) {
    return res.status(500).send(`Unknown server error: ${error}`);
  }
});

router.post("/likes", async (req, res) => {
  const { user_email, artist_name, artist_id, artist_img } = req.body;

  // post a new liked artist record associated to a user
  const newLike = {
    user_email,
    artist_name,
    artist_id,
    artist_img
  };

  // Insert it into our database
  try {
    await knex('likes').insert(newLike);
    res.status(201).send("Liked successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send(req.body);
  }
});

router.get("/likes", async (req, res) => {
  const { user_email } = req.query;

  try {
    const likes = await knex('likes').where({ user_email }); // Filter comments by artist_id

    res.json(likes);
  } catch (error) {
    return res.status(401).send("Invalid request");
  }
});

// Remove a liked playlist
router.delete('/likes', async (req, res) => {
  const { user_email, artist_id } = req.query;
  try {
    const likedArtist = await knex('likes').where({
      user_email: user_email,
      artist_id: artist_id
    }).delete();

    if (likedArtist > 0) {
      return res.status(200).send("Successfully deleted!");
    } else {
      return res.status(404).send("No artist to be removed...");
    }
  } catch (error) {
    res.status(500).send(`Something went wrong: ${error}`);
  }
});

module.exports = router;