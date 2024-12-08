const express = require('express');
const router = express.Router();
const { listPosts, disablePost, getPostById } = require('../../controllers/admin/postController');
const verifyAdmin = require('../../middlewares/verifyAdmin');

router.get('/', verifyAdmin, listPosts);
router.get('/:_id', verifyAdmin, getPostById);
router.patch('/disable/:_id', verifyAdmin, disablePost);

module.exports = router;