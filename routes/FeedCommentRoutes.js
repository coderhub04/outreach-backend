const express =  require('express');
const decryptFirebaseToken = require('../middlewares/decryptFirebaseToken');
const { createComment } = require('../controllers/FeedCommentController');
const router = express.Router();

router.post("/:_id", decryptFirebaseToken, createComment)


module.exports = router;