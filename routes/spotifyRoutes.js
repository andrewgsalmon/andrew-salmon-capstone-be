// const router = require('express').Router();
// const axios = require('axios');

// const CLIENT_ID = process.env.CLIENT_ID
// const CLIENT_SECRET = process.env.CLIENT_SECRET

// const dotenv = require("dotenv");
// dotenv.config();

// router.get('/refresh_token', async function(req, res) {
//   const refresh_token = req.query.refresh_token;

//   const authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
//     },
//     data: new URLSearchParams({
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     }),
//     method: 'POST'
//   };

//   try {
//     const response = await axios(authOptions);
//     if (response.status === 200) {
//       const { access_token, refresh_token } = response.data;
//       res.send({
//         'access_token': access_token,
//         'refresh_token': refresh_token
//       });
//     } else {
//       res.status(response.status).send(response.data);
//     }
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     res.status(500).send(`Error refreshing token: ${error}`);
//   }
// });

module.exports = router;