const express = require('express');
const router = express.Router();
const { 
    followUser, 
} = require('../controllers/FollowingController');

router.post("/:userId/:id", followUser);

module.exports = router;