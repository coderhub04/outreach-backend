const express = require('express');
const router = express.Router();
const { listStory, disableStory } = require('../../controllers/admin/storyController');
const verifyAdmin = require('../../middlewares/verifyAdmin');

router.get('/', verifyAdmin, listStory);
router.patch('/disable/:_id', verifyAdmin, disableStory);

module.exports = router;