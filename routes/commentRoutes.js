const knex = require('knex')(require('../knexfile'));
const router = require('express').Router();

// ## POST /api/users/register
// - Creates a new user.
router.post("/comment", async (req, res) => {
    const { name, email, comment, artist_id } = req.body;

    if (!name || !email || !comment || !artist_id) {
        return res.status(400).send("Are you new to this? Add a comment before you post!");
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
        res.status(201).send("Success! Comment posted.");
    } catch (error) {
        console.log(error);
        res.status(400).send(req.body);
    }
});

// ## GET /api/artists/comments
router.get("/comments/:artist_id", async (req, res) => {
    const { artist_id } = req.params; // Get the artist_id from the URL parameters

    try {
        const comments = await knex('comments').where({ artist_id }); // Filter comments by artist_id

        res.json(comments);
    } catch (error) {
        return res.status(401).send("Invalid request");
    }
});

module.exports = router;