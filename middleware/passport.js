const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const knex = require("knex")(require("../knexfile"));
require("dotenv").config();
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails.length) {
          throw new Error("Email not available in profile");
        }

        let user = await knex("users")
          .where({ email: profile.emails[0].value })
          .first();

        if (user) {
          return done(null, user);
        } else {
          const newUser = {
            email: profile.emails[0].value,
            name: profile.name.givenName,
          };

          const createdUser = (
            await knex("users").insert(newUser).returning("*")
          )[0];

          const confirmedUser = await knex("users")
          .where({ email: newUser.email })
          .first();

          return done(null, confirmedUser);
        }
      } catch (error) {
        console.error("Error during user lookup or creation:", error);
        return done(error, false);
      }
    }
  )
);

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
