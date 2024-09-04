const router = require("express").Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const session = require("express-session");
const crypto = require("crypto");
require("dotenv").config();
const { CLIENT_URL, JWT_KEY } = process.env;

passport.initialize();

router.use(
  session({
    secret: crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

router.use(passport.initialize());
router.use(passport.session());

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

router.get(
  "/spotify",
  passport.authenticate(
    "spotify",
    {
      scope: ["user-read-email", "user-read-private"],
    },
    { failureRedirect: "/login" }
  )
);

router.get(
  "/spotify/callback",
  passport.authenticate("spotify", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      JWT_KEY,
      { expiresIn: "24h" }
    );
    res.redirect(`${CLIENT_URL}/login?token=${token}`);
  }
);

module.exports = router;
