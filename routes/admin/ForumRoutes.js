const express = require('express');
const router = express.Router();
const { getForum, updateForum, disableForum, deleteForum, getForumById } = require('../../controllers/admin/forumController');
const verifyAdmin = require('../../middlewares/verifyAdmin');

router.get('/', verifyAdmin, getForum);
router.get('/:_id', verifyAdmin, getForumById);
router.patch('/:_id', verifyAdmin, updateForum);
router.patch('/disable/:_id', verifyAdmin, disableForum);
router.delete('/:_id', verifyAdmin, deleteForum);

module.exports = router;