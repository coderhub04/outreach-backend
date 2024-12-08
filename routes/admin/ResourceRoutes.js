const express = require('express');
const router = express.Router();
const verifyAdmin = require('../../middlewares/verifyAdmin');
const { approveResources, listResources, disableResources, getResourceById } = require('../../controllers/admin/resourceController');

router.get('/', verifyAdmin, listResources);
router.get('/:_id', verifyAdmin, getResourceById);
router.patch('/disable/:_id', verifyAdmin, disableResources);
router.patch('/approve/:_id', verifyAdmin, approveResources);

module.exports = router;