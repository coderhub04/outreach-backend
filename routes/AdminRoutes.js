const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin');
const { 
    adminSignUpController, 
    adminLoginController, 
    updateAdminPasswordController 
} = require('../controllers/AdminController');

router.post("/signup", adminSignUpController);
router.post("/signin", adminLoginController);
router.patch("/change-password", verifyAdmin, updateAdminPasswordController);

module.exports = router;