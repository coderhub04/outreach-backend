const express = require('express');
const router = express.Router();
const decryptFirebaseToken = require("../middlewares/decryptFirebaseToken");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { createReport } = require('../controllers/ReportController');

router.post("/create", decryptFirebaseToken, createReport);


module.exports = router;