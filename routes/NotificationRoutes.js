const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require('../middlewares/decryptFirebaseToken');
const { getUserNotifications} = require('../controllers/NotificationController');


router.get("/:userID", decryptFirebaseToken, getUserNotifications);

module.exports = router;