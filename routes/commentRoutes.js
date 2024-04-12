const knex = require('knex')(require('../knexfile'));
const router = require('express').Router();

// ## POST /api/users/register
// - Creates a new user.
router.post("/comment", async (req, res) => {
  const { name, email, comment, artist_id } = req.body;

  if (!name || !email || !comment || !artist_id) {
      return res.status(400).send("Please enter a comment...");
  }

  // Post a new comment
  const newComment = {
      name,
      email,
      comment,
      artist_id
  };

  // Insert it into our database
  try {
      await knex('comments').insert(newComment);
      res.status(201).send("Posted successfully");
  } catch (error) {
      console.log(error);
      res.status(400).send(req.body);
  }
});

// ## GET /api/artists/comments
// -   Gets information about the currently logged in user.
// -   If no valid JWT is provided, this route will respond with 401 Unauthorized.
// -   Expected headers: { Authorization: "Bearer JWT_TOKEN_HERE" }
router.get("/comments/:artist_id", async (req, res) => {
  const { artist_id } = req.params; // Get the artist_id from the URL parameters

  try {
      const comments = await knex('comments').where({ artist_id }); // Filter comments by artist_id

      res.json(comments);
  } catch (error) {
      return res.status(401).send("Invalid request");
  }
});


// router.get("/current", authorize, async (req, res) => {

// try{
//       //req.user should have {id,email}
//       //could put this line below in middleware too so you have
//       //actual user data in all your endpoints
//   const user = await knex('users').where({id: req.user.id}).first();
//       res.json(user);
//   } catch (error) {
//       return res.status(500).send(`Unknown server error: ${error}`);
//   }
// });

module.exports = router;