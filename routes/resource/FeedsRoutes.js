const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require("../../middlewares/decryptFirebaseToken");
// const verifyAdmin = require("../middlewares/verifyAdmin");
const {
    createFeedController,
    updateFeedController,
    getFeedController,
    addLikeOnFeedController,
    deleteFeedController
} = require('../../controllers/resources/FeedsController');

router.post("/create", decryptFirebaseToken, createFeedController);
router.patch("/update/:feedId", decryptFirebaseToken, updateFeedController);
router.get("/get", decryptFirebaseToken, getFeedController);
// router.patch("/comment", decryptFirebaseToken, addCommentOnFeedController);
router.patch("/like/:feedId", decryptFirebaseToken, addLikeOnFeedController);
router.delete("/delete/:feedId", decryptFirebaseToken, deleteFeedController);
// router.patch("/block/:feedId", verifyAdmin, blockFeedController);

module.exports = router;