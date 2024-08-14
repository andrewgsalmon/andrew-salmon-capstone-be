const knex = require("knex")(require("../knexfile"));
const router = require("express").Router();

router.post("/comment", async (req, res) => {
  const { name, email, comment, artist_id } = req.body;

  if (!name || !email || !comment || !artist_id) {
    return res
      .status(400)
      .send("Are you new to this? Add a comment before you post!");
  }

  const newComment = {
    name,
    email,
    comment,
    artist_id,
  };

  try {
    await knex("comments").insert(newComment);
    res.status(201).send("Success! Comment posted.");
  } catch (error) {
    console.log(error);
    res.status(400).send(req.body);
  }
});

router.get("/comments/:artist_id", async (req, res) => {
  const { artist_id } = req.params;

  try {
    const comments = await knex("comments").where({ artist_id });

    res.json(comments);
  } catch (error) {
    return res.status(401).send("Invalid request");
  }
});

module.exports = router;
