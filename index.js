const express = require("express");
const app = express();
const recosRoutes = require("./routes/recos");
const tokenRoutes = require("./routes/spotifyToken.js")
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT;
const { CORS_ORIGIN } = process.env;

app.use(cors({ origin: CORS_ORIGIN }));

app.use(express.json());

// app.use("/videos", express.static("./public/images"));

app.use("/recos", recosRoutes);

app.use("/token", tokenRoutes);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));