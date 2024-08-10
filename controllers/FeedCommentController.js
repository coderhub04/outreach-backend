const sendResponse = require('../utils/response');
const FeedCommentModel = require('../models/FeedCommentModel');


const createComment = async (req, res) => {
    try {

        const newComment = new FeedCommentModel({ postID: req.params._id, author: req.user, ...req.body });
        const savedComment = await newComment.save();
        return sendResponse(200, true, "Comment posted successfully", savedComment, res);
    }
    catch (error) {
        console.error("Error while blocking user:", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

const getPostComments = async (req, res) => {
    try {

        const comments = await FeedCommentModel.find({ postID: req.params._id }).populate('author', 'username name imageUrl');
        if (comments.length <= 0) return sendResponse(200, false, "No comments", [], res);
        return sendResponse(200, true, "Comment fetched successfully", comments, res);
    }
    catch (error) {
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

module.exports = { createComment, getPostComments };