const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require('../middlewares/decryptFirebaseToken');
const { getUserNotifications, sendNotificationUsingFCM, sendMessageNotificationUsingFCM, sendDeclineNotificationUsingFCM} = require('../controllers/NotificationController');


router.get("/:userID", decryptFirebaseToken, getUserNotifications);

router.post("/fcm/send/:_id", sendNotificationUsingFCM)
router.post("/fcm/message/:_id", sendMessageNotificationUsingFCM)
router.post("/fcm/decline/:_id", sendDeclineNotificationUsingFCM)

module.exports = router;