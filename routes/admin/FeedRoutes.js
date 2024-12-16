const express = require('express');
const router = express.Router();
const { listPosts, disablePost, getPostById, reportedPosts } = require('../../controllers/admin/postController');
const verifyAdmin = require('../../middlewares/verifyAdmin');

router.get('/', verifyAdmin, listPosts);
router.get('/:_id', verifyAdmin, getPostById);
router.get('/reported/get', verifyAdmin, reportedPosts);
router.patch('/disable/:_id', verifyAdmin, disablePost);

module.exports = router;