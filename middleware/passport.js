const passport = require("passport");
const knex = require("knex")(require("../knexfile"));
require("../strategies/googleStrategy")(passport);
require("../strategies/spotifyStrategy")(passport);

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  try {
    const user = await knex("users").where({ email }).first();
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});

module.exports = passport;