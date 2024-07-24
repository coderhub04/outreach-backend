const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require("../middlewares/decryptFirebaseToken");
const { 
    getHelpRequestController, 
    registerHelpRequestController, 
    getHelpRequestByUserController 
} = require('../controllers/HelpAndSupportController');

router.post("/register", decryptFirebaseToken, registerHelpRequestController);
router.get("/get", getHelpRequestController);
router.get("/get/:id", getHelpRequestByUserController);

module.exports = router;