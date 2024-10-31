const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require('../middlewares/decryptFirebaseToken');
const verifyAdmin = require("../middlewares/verifyAdmin");
const { createStory, deleteStory, getStories } = require('../controllers/StoryController');


router.post("/create", decryptFirebaseToken, createStory);
router.get("/get", getStories);
router.delete("/delete/:storyID", decryptFirebaseToken, deleteStory);

module.exports = router;