const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require("../middlewares/decryptFirebaseToken");
const { createForum, getForum, joinForum, leaveForum, createForumPost, getForumPost, addLikeOnForumFeedController } = require('../controllers/ForumController');

router.post('/', decryptFirebaseToken, createForum);
router.get('/', getForum);
router.patch('/join/:_id', decryptFirebaseToken, joinForum);
router.patch('/leave/:_id', decryptFirebaseToken, leaveForum);
router.get('/forum-post/:_id', decryptFirebaseToken, getForumPost);
router.post('/forum-post/:_id', decryptFirebaseToken, createForumPost);
router.patch("/forum-post/like/:feedId", decryptFirebaseToken, addLikeOnForumFeedController);

module.exports = router;