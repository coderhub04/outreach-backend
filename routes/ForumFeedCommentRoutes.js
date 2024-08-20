const express =  require('express');
const decryptFirebaseToken = require('../middlewares/decryptFirebaseToken');
const { createComment, getPostComments } = require('../controllers/ForumFeedCommentController');
const router = express.Router();

router.post("/:_id", decryptFirebaseToken, createComment)

router.get("/:_id", decryptFirebaseToken, getPostComments)


module.exports = router;