const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require('../middlewares/decryptFirebaseToken');
const verifyAdmin = require("../middlewares/verifyAdmin");
const {
    registerUserController,
    updateUserController,
    getUserProfileController,
    getAllUserController,
    blockUserController,
    followUserController,
    unFollowUserController,
    userLoginController,
    getCurrentProfileController,
    userSearchUsernameAndName,
    globalSearch,
} = require("../controllers/UserController");
const userBlockStatus = require('../middlewares/userBlockStatus');

router.post("/register", decryptFirebaseToken, registerUserController);
router.patch("/update", decryptFirebaseToken, updateUserController);
router.get("/profile/:id/:userID", getUserProfileController);
router.get("/current-user", decryptFirebaseToken, getCurrentProfileController);
router.get("/get", getAllUserController);
router.patch("/block/:userId", verifyAdmin, blockUserController);
router.post("/follow/:followUserId", decryptFirebaseToken, followUserController);
router.delete("/unfollow/:unFollowUserId", decryptFirebaseToken, unFollowUserController);
router.post("/login", decryptFirebaseToken, userLoginController);
router.get("/block-status", userBlockStatus);
router.get("/search", userSearchUsernameAndName);
router.get("/global/search", globalSearch)

module.exports = router;