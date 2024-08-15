const express = require('express');
const router = express.Router();
const { getForum, updateForum, disableForum, deleteForum } = require('../../controllers/admin/forumController');
const verifyAdmin = require('../../middlewares/verifyAdmin');

router.get('/', verifyAdmin, getForum);
router.patch('/:_id', verifyAdmin, updateForum);
router.patch('/disable/:_id', verifyAdmin, disableForum);
router.delete('/:_id', verifyAdmin, deleteForum);

module.exports = router;