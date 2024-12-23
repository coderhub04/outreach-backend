const { default: mongoose } = require('mongoose');
const ForumFeedModel = require('../models/ForumFeedModel');
const ForumModel = require('../models/ForumModel');
const sendResponse = require('../utils/response');
const UserModel = require('../models/UserModel');
const ForumFeedCommentModel = require('../models/ForumFeedCommentModel');
const sanitizeData = require('../utils/sanitizeData');
const NotificationModel = require('../models/NotificationModel');

const createForum = async (req, res) => {
    try {
        const newForum = new ForumModel({ ...req.body, userId: req.user });
        newForum.joined.push(req.user)
        const savedForum = await newForum.save()
        return sendResponse(200, true, 'Forum created', savedForum, res);
    } catch (error) {
        console.log(error)
        return sendResponse(500, false, error.message, null, res);
    }
}

const getForums = async (req, res) => {
    try {
        const forums = await ForumModel.find({ deleted: false, disabled: false }).populate('userId');
        return sendResponse(200, true, 'Forum fetched', forums, res);
    } catch (error) {
        return sendResponse(500, false, error.message, null, res);
    }
}

const getForum = async (req, res) => {
    try {
        const forums = await ForumModel.findOne({ _id: req.params._id, deleted: false, disabled: false }).populate('userId');
        return sendResponse(200, true, 'Forum fetched', forums, res);
    } catch (error) {
        return sendResponse(500, false, error.message, null, res);
    }
}

const joinForum = async (req, res) => {
    try {
        const forum = await ForumModel.findByIdAndUpdate(req.params._id,
            {
                $addToSet: {
                    joined: req.user._id
                }
            }, {
            returnOriginal: false
        }).populate('userId');
        return sendResponse(200, true, 'Forum joined', forum, res);
    } catch (error) {
        return sendResponse(500, false, error.message, null, res);
    }
}

const leaveForum = async (req, res) => {
    try {
        const forum = await ForumModel.findByIdAndUpdate(req.params._id,
            {
                $pull: {
                    joined: req.user._id
                }
            }, {
            returnOriginal: false
        }).populate('userId');
        return sendResponse(200, true, 'Forum Updated', forum, res);
    } catch (error) {
        return sendResponse(500, false, error.message, null, res);
    }
}

const createForumPost = async (req, res) => {
    try {
        const forumPost = new ForumFeedModel({ ...req.body, userId: req.user._id, forum: req.params._id });
        const savedForumPost = await forumPost.save();
        const user = await UserModel.findById(req.user._id)
        return sendResponse(200, true, 'Forum Post created!', { ...savedForumPost.toObject(), user: user.toObject(), liked: false, likes: [], commentCount: 0 }, res);
    } catch (error) {
        console.log(error)
        return sendResponse(500, false, error.message, null, res);
    }
}
const deleteForumPost = async (req, res) => {
    try {
        const deletedPost = await ForumFeedModel.findByIdAndUpdate(req.params._id, {
            deleted: true
        })
        if (deletedPost) {
            return sendResponse(200, true, 'Forum Post deleted!', deletedPost, res);
        } else {
            return sendResponse(400, true, 'Something went wrong', null, res);
        }
    } catch (error) {
        console.log(error)
        return sendResponse(500, false, error.message, null, res);
    }
}

const getForumPost = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const forumId = req.params._id;

        const aggregationPipeline = [
            {
                $match: {
                    forum: new mongoose.Types.ObjectId(forumId),
                    block: false,
                    deleted: false
                }
            },
            {
                $facet: {
                    metadata: [
                        { $count: "total" }
                    ],
                    data: [
                        { $sort: { createdAt: -1 } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user'
                            }
                        },
                        { $unwind: '$user' },
                        {
                            $addFields: {
                                likesCount: { $size: "$likes" },
                                liked: { $in: [new mongoose.Types.ObjectId(req.user._id), "$likes"] }
                            }
                        },
                        {
                            $lookup: {
                                from: 'feed_comments',
                                let: { postId: '$_id' },
                                pipeline: [
                                    { $match: { $expr: { $eq: ["$postID", "$$postId"] } } },
                                    { $count: "commentCount" }
                                ],
                                as: 'commentData'
                            }
                        },
                        {
                            $addFields: {
                                commentCount: { $ifNull: [{ $arrayElemAt: ["$commentData.commentCount", 0] }, 0] }
                            }
                        },
                        {
                            $project: {
                                content: 1,
                                likesCount: 1,
                                createdAt: 1,
                                media: 1,
                                public: 1,
                                liked: 1,
                                likes: 1,
                                commentCount: 1,
                                "user.username": 1,
                                "user.imageUrl": 1,
                                "user.name": 1,
                                "user._id": 1,
                                "forum": 1
                            }
                        },
                        { $skip: (page - 1) * limit },
                        { $limit: Number(limit) }
                    ]
                }
            },
            {
                $project: {
                    data: 1,
                    metadata: { $arrayElemAt: ["$metadata.total", 0] }
                }
            }
        ];

        const result = await ForumFeedModel.aggregate(aggregationPipeline).exec();

        const totalPosts = result[0]?.metadata || 0;
        const totalPages = Math.ceil(totalPosts / limit);
        const forumPosts = result[0]?.data || [];

        if (forumPosts.length === 0) {
            return sendResponse(200, false, "No Forum Posts Found", {
                forumPosts,
                totalPosts,
                totalPages,
                currentPage: parseInt(page)
            }, res);
        }

        return sendResponse(200, true, "Forum Posts Fetched Successfully", {
            forumPosts,
            totalPosts,
            totalPages,
            currentPage: parseInt(page)
        }, res);
    } catch (error) {
        console.error("Error while getting forum posts: ", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};


const addLikeOnForumFeedController = async (req, res) => {
    try {
        const { user_id } = sanitizeData(req.userToken);
        const { feedId } = sanitizeData(req.params);

        if (!mongoose.Types.ObjectId.isValid(feedId)) {
            return sendResponse(400, false, "Invalid Feed ID", null, res);
        }

        const feed = await ForumFeedModel.findById(feedId);
        if (!feed) {
            return sendResponse(404, false, "Feed Not Found", null, res);
        }

        const user = await UserModel.findOne({ firebaseAuthId: user_id });
        if (!user) {
            return sendResponse(404, false, "User Not Found", null, res);
        }

        if (user.block) {
            return sendResponse(403, false, "Cannot Like the Feed", null, res);
        }

        const alreadyLiked = feed.likes.includes(user._id);
        let updatedFeed;

        if (alreadyLiked) {
            await ForumFeedModel.findByIdAndUpdate(feedId, { $pull: { likes: user._id } });
        } else {
            await ForumFeedModel.findByIdAndUpdate(feedId, { $push: { likes: user._id } });
            await NotificationModel.create({
                from: user._id,
                to: feed.userId,
                title: `@${user.username} liked your forum post`,
                timestamp: Date.now(),
                description: `@${user.username} liked your forum post`,
                post: feed._id,
                type: "forum-post-like"
            })
        }
        updatedFeed = await ForumFeedModel.findById(feedId)
            .populate({
                path: "userId",
                select: "name username imageUrl",
                model: "users",
                options: {
                    virtuals: true,
                    justOne: true,
                    virtualName: 'user'
                }
            })
            .lean();

        updatedFeed.user = updatedFeed.userId;
        delete updatedFeed.userId;
        const commentsCount = await ForumFeedCommentModel.find({ postID: feedId }).countDocuments();
        updatedFeed.likesCount = updatedFeed.likes.length;
        updatedFeed.commentCount = commentsCount;
        updatedFeed.liked = !alreadyLiked;

        return sendResponse(200, true, `Like ${alreadyLiked ? "Removed" : "Added"} Successfully`, updatedFeed, res);
    } catch (error) {
        console.error("Error while adding/removing like on feed:", error);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

module.exports = {
    createForum,
    getForum,
    getForums,
    deleteForumPost,
    joinForum,
    leaveForum,
    createForumPost,
    getForumPost,
    addLikeOnForumFeedController
}
