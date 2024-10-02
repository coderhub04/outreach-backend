const express = require('express');
const router = express.Router();
const { createResourceCategory, getAllEnabledResourceCategory } = require('../../controllers/resources/Category');
const verifyAdmin = require('../../middlewares/verifyAdmin');

router.post('/create', verifyAdmin, createResourceCategory);
router.get('/get', getAllEnabledResourceCategory);

module.exports = router;