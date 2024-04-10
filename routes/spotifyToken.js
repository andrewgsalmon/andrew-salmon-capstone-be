const express = require("express");
const router = express.Router();
// const fs = require("fs");
const axios = require('axios');
require('dotenv').config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

router.get('/access-token', async (req, res) => {
  try {
    // Make a POST request to the Spotify API to obtain the access token
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      },
      params: {
        grant_type: 'client_credentials'
      }
    });

    // Extract and send the access token in the response
    const accessToken = response.data.access_token;
    res.json({ access_token: accessToken });
  } catch (error) {
    // Handle errors
    console.error('Error fetching Spotify access token:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;