const knex = require("knex")(require("../knexfile"));
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authorize = require("../middleware/authorize");
const allUsers = process.env.ALL_USERS;

const multer = require("multer");
const crypto = require("crypto");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const dotenv = require("dotenv");
dotenv.config();

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

router.post("/register", async (req, res) => {
  const { name, email, fav_artists, location, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("See those required fields? Get to work!");
  }

  const hashedPassword = bcrypt.hashSync(password);

  const newUser = {
    name,
    fav_artists,
    location,
    email,
    password: hashedPassword,
  };

  let existingUser = await knex("users").where("email", newUser.email).first();

  if (existingUser) {
    return res
      .status(400)
      .send("Oops! Email already registered... Try logging in!");
  }

  try {
    await knex("users").insert(newUser);
    res.status(201).send("Registered successfully");
  } catch (error) {
    res.status(400).send("Server error!  Ugh...");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await knex("users").where({ email: email }).first();

    if (!user) {
      return res
      .status(404)
      .send(
        "Hmm... no account exists under that email!  Be sure to register."
      );
    }

    if (!user.password) {
      return res.status(401).send(`Whoops! Looks like you registered via ${user.auth_provider}. Login via the provider below.`)
    }

    const isPasswordCorrect = bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .send("Incorrect password! Let's try that again...");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "24h" }
    );
    res.json({ token: token });
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    return res.status(500).send(`Something went wrong: ${error.message}`);
  }
});

router
  .route("/profile-img")
  .post(upload.single("avatar"), async (req, res) => {
    if (!req.file) {
      return res.status(400).send("Whoops! You gotta send an image there...");
    }

    const { user_email } = req.body;
    req.file.buffer;

    const imageName = randomImageName();
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    await s3.send(command);

    try {
      await knex("users")
        .where({ email: user_email })
        .update({ profile_img: imageName });

      res.status(202).send({ message: "Profile image updated successfully" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("An error occurred");
    }
  })
  .get(async (req, res) => {
    const { email } = req.query;
    const user = await knex("users").where({ email: email }).first();

    const getObjectParams = {
      Bucket: bucketName,
      Key: user.profile_img,
    };
    const command = new GetObjectCommand(getObjectParams);
    const profileImageUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });

    try {
      res.send(profileImageUrl);
    } catch (error) {
      return res.status(500).send(`Unknown server error: ${error}`);
    }
  });

router.get("/current", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send("Please login");
  }

  const authHeader = req.headers.authorization;
  const authToken = authHeader.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(authToken, process.env.JWT_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send("Token expired. Please login again.");
    }
    return res.status(401).send("Invalid auth token");
  }

  try {
    const user = await knex("users").where({ id: decoded.id }).first();
    const getObjectParams = {
      Bucket: bucketName,
      Key: user.profile_img,
    };
    const command = new GetObjectCommand(getObjectParams);
    const profileImageUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });

    const completeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      location: user.location,
      fav_artists: user.fav_artists,
      profile_img: profileImageUrl,
    };

    delete user.password;
    res.json(completeUser);
  } catch (error) {
    return res.status(401).send("Invalid auth token");
  }
});

router
  .route("/likes")
  .post(async (req, res) => {
    const { user_email, artist_name, artist_id, artist_img, artist_genre } =
      req.body;

    const newLike = {
      user_email,
      artist_name,
      artist_id,
      artist_img,
      artist_genre,
    };

    try {
      await knex("likes").insert(newLike);
      res.status(201).send("Nice! We've saved the artist to your profile.");
    } catch (error) {
      console.error(error);
      res.status(400).send(req.body);
    }
  })
  .get(async (req, res) => {
    const { user_email } = req.query;

    try {
      const likes = await knex("likes").where({ user_email });

      res.json(likes);
    } catch (error) {
      return res.status(401).send("Invalid request");
    }
  })
  .delete(async (req, res) => {
    const { user_email, artist_id } = req.query;
    try {
      const likedArtist = await knex("likes")
        .where({
          user_email: user_email,
          artist_id: artist_id,
        })
        .delete();

      if (likedArtist > 0) {
        return res.status(200).send("Successfully deleted!");
      } else {
        return res
          .status(404)
          .send("Hmm. Artist wasn't found in your profile... Strange!");
      }
    } catch (error) {
      res.status(500).send(`Something went wrong: ${error}`);
    }
  });

module.exports = router;
