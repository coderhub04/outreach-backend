const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require('../middlewares/decryptFirebaseToken');
const { getUserNotifications, sendNotificationUsingFCM} = require('../controllers/NotificationController');


router.get("/:userID", decryptFirebaseToken, getUserNotifications);

router.post("/fcm/send/:_id", sendNotificationUsingFCM)

module.exports = router;