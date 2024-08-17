const router = require("express").Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();
const { CLIENT_URL, JWT_KEY } = process.env;

passport.initialize();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/google/failure",
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

router.get("/google/failure", (req, res) => {
  res.send("Something went wrong!");
});

module.exports = router;