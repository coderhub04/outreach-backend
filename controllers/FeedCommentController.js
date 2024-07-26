const sendResponse = require('../utils/response');
const FeedCommentModel = require('../models/FeedCommentModel');


const createComment = async (req, res) => {
    try {

        const newComment = new FeedCommentModel({postID: req.params._id, author: req.user, ...req.body});
        const savedComment = await newComment.save();
        if (!savedComment) return sendResponse(500, false, "Something went wrong", null, res);
        return sendResponse(200, true, "Comment posted successfully", blockUser, res);
    }
    catch (error) {
        console.error("Error while blocking user:", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

module.exports = { createComment };