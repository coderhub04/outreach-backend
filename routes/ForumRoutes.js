const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require("../middlewares/decryptFirebaseToken");
const { createForum, getForums, getForum, joinForum, leaveForum, createForumPost, getForumPost, addLikeOnForumFeedController, deleteForumPost } = require('../controllers/ForumController');

router.post('/', decryptFirebaseToken, createForum);
router.get('/', getForums);
router.get('/:_id', getForum);
router.patch('/join/:_id', decryptFirebaseToken, joinForum);
router.patch('/leave/:_id', decryptFirebaseToken, leaveForum);
router.get('/forum-post/:_id', decryptFirebaseToken, getForumPost);
router.post('/forum-post/:_id', decryptFirebaseToken, createForumPost);
router.delete('/forum-post/:_id', decryptFirebaseToken, deleteForumPost);
router.patch("/forum-post/like/:feedId", decryptFirebaseToken, addLikeOnForumFeedController);

module.exports = router;