const express = require("express");
const router = express.Router();
const fs = require("fs");

function returnRecos() {
  const recosData = fs.readFileSync("./data/recos.json");
  const parsedData = JSON.parse(recosData);
  return parsedData;
}

//GET endpoint for all videos
router.get("/", (_req, res) => {
  const recos = returnRecos();
  res.json(recos);
});

// GET endpoint for single recommendation
router.get("/:genre/:mood", (req, res) => {
  // Read the file and find the single recommendation whose id matches the requested id
  const reco = returnRecos();
  const singleReco = video.find((video) => video.id === req.params.videoId);
  //Respond with the single video
  res.json(singleVideo);
});

//POST endpoint to add a video
router.post("/", (req, res) => {
  // Make a new video with a unique id (unique id generated from client)
  const newVideo = {
    id: req.body.id,
    title: req.body.title,
    description: req.body.description,
    channel: req.body.channel,
    timestamp: req.body.timestamp,
    image: "image9.jpg",
    views: 0,
    likes: 0,
    duration: 0,
    video: "",
    comments: []
  };

  // 1. Read the current videos array
  // 2. Add to the videos array
  // 3. Write the entire new videos array to the file
  const videos = returnVideos();
  videos.push(newVideo);
  fs.writeFileSync("./data/recos.json", JSON.stringify(videos));

  // Respond with the video that was created
  res.status(201).json(newVideo);
});

//POST endpoint to add a comment to a video
router.post("/:videoId/", (req, res) => {
  // Make a new comment with a unique id (passing id in from post req)
  const videoId = req.params.videoId;
  const newComment = {
    name: req.body.name,
    comment: req.body.comment,
    timestamp: req.body.timestamp,
    likes: 0,
    id: req.body.id
  };

  // Read the current videos array
  let videos = returnVideos();

  // Find the video with the specified videoId
  const video = videos.find((video) => video.id === videoId);

  // Add the new comment to the comments of the found video)
  // (new comments 'unshifted' in order to keep newest comments on top)
  video.comments.unshift(newComment);

  // 1. Read the current videos array
  // 2. Add to the videos array
  // 3. Write the entire new videos array to the file
  // const comments = returnVideos();
  // comments.push(newComment);
  fs.writeFileSync("./data/recos.json", JSON.stringify(videos));

  // Respond with the comment that was created
  res.status(201).json(newComment);
});

module.exports = router;