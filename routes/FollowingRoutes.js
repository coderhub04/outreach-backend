const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require("../middlewares/decryptFirebaseToken");
const { 
    followUser, 
} = require('../controllers/FollowingController');

router.post("/follow/:id", decryptFirebaseToken, followUser);

module.exports = router;