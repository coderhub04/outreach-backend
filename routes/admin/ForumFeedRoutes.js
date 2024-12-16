const express = require('express');
const router = express.Router();
const { getForumPostById, getForumPosts, disableForumPost } = require('../../controllers/admin/forumFeedController');
const verifyAdmin = require('../../middlewares/verifyAdmin');

router.get('/', verifyAdmin, getForumPosts);
router.get('/:_id', verifyAdmin, getForumPostById);
router.patch('/disable/:_id', verifyAdmin, disableForumPost);

module.exports = router;