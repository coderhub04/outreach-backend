const sendResponse = require('../utils/response');
const ForumFeedCommentModel = require('../models/ForumFeedCommentModel');
const { default: mongoose } = require('mongoose');
const NotificationModel = require('../models/NotificationModel');
const UserModel = require('../models/UserModel');


const createComment = async (req, res) => {
    try {
        const fromUser = await UserModel.findById(req.user);
        const newComment = new ForumFeedCommentModel({ postID: req.params._id, author: req.user, ...req.body, createdAt: Date.now() });
        const savedComment = await newComment.save();
        // await NotificationModel.create({
        //     from: fromUser._id,
        //     to: feed.userId,
        //     title: `@${fromUser.username} added a comment on your post`,
        //     timestamp: Date.now(),
        //     description: `@${fromUser.username} added a comment on your post`,
        //     post: req.params._id,
        //     type: "feed-comment"
        // })
        return sendResponse(200, true, "Comment posted successfully", { ...savedComment.toObject(), liked: false, likesCount: 0 }, res);
    }
    catch (error) {
        console.error("Error while blocking user:", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

const getPostComments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user._id;

        const aggregationPipeline = [
            { $match: { postID: new mongoose.Types.ObjectId(req.params._id) } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' },
            {
                $addFields: {
                    likesCount: { $size: '$likes' },
                    liked: { $in: [userId, '$likes'] }
                }
            },
            {
                $project: {
                    text: 1,
                    createdAt: 1,
                    likesCount: 1,
                    liked: 1,
                    'author.username': 1,
                    'author.name': 1,
                    'author.imageUrl': 1
                }
            },
            { $skip: (page - 1) * limit },
            { $limit: Number(limit) }
        ];

        const commentsAggregation = await ForumFeedCommentModel.aggregate(aggregationPipeline).exec();

        const totalComments = await ForumFeedCommentModel.countDocuments({ postID: req.params._id });
        const totalPages = Math.ceil(totalComments / limit);

        if (commentsAggregation.length === 0) {
            return sendResponse(200, false, "No comments found", {
                comments: [],
                totalComments,
                totalPages,
                currentPage: parseInt(page)
            }, res);
        }
        return sendResponse(200, true, "Comments fetched successfully", {
            comments: commentsAggregation,
            totalComments,
            totalPages,
            currentPage: parseInt(page)
        }, res);
    } catch (error) {
        console.error("Error while fetching comments: ", error.message);
        return sendResponse(500, false, "Internal Server Error", [], res);
    }
};

module.exports = { createComment, getPostComments };