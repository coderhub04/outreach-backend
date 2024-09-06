const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require("../middlewares/decryptFirebaseToken");
const { 
    followUser, 
} = require('../controllers/FollowingController');

router.post("/:id", decryptFirebaseToken, followUser);

module.exports = router;