const express = require('express');
const router = express.Router();
const { getUserById, listUsers, disableUser } = require('../../controllers/admin/userController');
const verifyAdmin = require('../../middlewares/verifyAdmin');

router.get('/', verifyAdmin, listUsers);
router.get('/:_id', verifyAdmin, getUserById);
router.patch('/disable/:_id', verifyAdmin, disableUser);

module.exports = router;