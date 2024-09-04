const SpotifyStrategy = require("passport-spotify").Strategy;
const knex = require("knex")(require("../knexfile"));
require("dotenv").config();

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SERVER_URL } = process.env;

module.exports = function (passport) {
  passport.use(
    new SpotifyStrategy(
      {
        clientID: SPOTIFY_CLIENT_ID,
        clientSecret: SPOTIFY_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/auth/spotify/callback`,
      },
      async (accessToken, refreshToken, expires_in, profile, done) => {
        try {
          if (!profile.emails || !profile.emails.length) {
            throw new Error("Email not available in profile");
          }

          let user = await knex("users")
            .where({ email: profile.emails[0].value })
            .first();

          if (user) {
            if (user.auth_provider !== "Spotify") {
              await knex("users")
                .where({ email: profile.emails[0].value })
                .update({ auth_provider: "Spotify" });
            }
            return done(null, user);
          } else {
            const newUser = {
              email: profile.emails[0].value,
              name: profile.name.givenName,
              auth_provider: "Spotify",
            };

            await knex("users").insert(newUser);

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
};
