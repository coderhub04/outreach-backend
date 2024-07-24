const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require("../middlewares/decryptFirebaseToken");
const { createForum, getForum, joinForum, leaveForum, createForumPost, getForumPost } = require('../controllers/ForumController');

router.post('/', decryptFirebaseToken, createForum);
router.get('/', getForum);
router.patch('/join/:_id', decryptFirebaseToken, joinForum);
router.patch('/leave/:_id', decryptFirebaseToken, leaveForum);
router.get('/forum-post/:_id', getForumPost);
router.post('/forum-post/:_id', decryptFirebaseToken, createForumPost);

module.exports = router;