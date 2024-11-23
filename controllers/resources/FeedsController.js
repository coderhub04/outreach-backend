const FeedCommentModel = require("../../models/FeedCommentModel");
const NotificationModel = require("../../models/NotificationModel");
const ResourceFeedsModel = require("../../models/ResourceFeed");
const UserModel = require("../../models/UserModel");
const sendResponse = require("../../utils/response");
const sanitizeData = require("../../utils/sanitizeData");
const mongoose = require("mongoose");

const createFeedController = async (req, res) => {
    try {
        const data = sanitizeData(req.body);
        const { user_id } = sanitizeData(req.userToken);

        const user = await UserModel.findOne({ firebaseAuthId: user_id });
        if (!user) {
            return sendResponse(404, false, "User Not Found", null, res);
        }

        if (user.block) {
            return sendResponse(403, false, "Cannot Upload Feed", null, res);
        }

        const feedData = {
            ...data,
            userId: user._id,
        };

        const newFeed = new ResourceFeedsModel(feedData);
        await newFeed.save();

        const resource = await ResourceFeedsModel.findById(newFeed._id)
        return sendResponse(201, true, "Feed Uploaded Successfully", { ...resource.toObject(), liked: false, likesCount: 0, commentCount: 0, user: user }, res);
    }
    catch (error) {
        console.error("Error while creating Feed: ", error);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

const updateFeedController = async (req, res) => {
    try {
        const { user_id } = sanitizeData(req.userToken);
        const { feedId } = sanitizeData(req.params);
        const updateData = sanitizeData(req.body.updateData);

        if (!feedId) {
            return sendResponse(400, false, "Feed ID Missing", null, res);
        }

        const user = await UserModel.findOne({ firebaseAuthId: user_id });
        if (!user) {
            return sendResponse(400, false, "Invalid User Id", null, res);
        }

        const feed = await ResourceFeedsModel.findById(feedId);
        if (!feed) {
            return sendResponse(404, false, "Feed Does Not Exist", null, res);
        }

        if (feed.userId.toString() !== user._id.toString()) {
            return sendResponse(403, false, "Access Denied", null, res);
        }

        if (user.block) {
            return sendResponse(403, false, "Cannot Update Post", null, res);
        }
        const alreadyLiked = feed.likes.includes(user._id);
        let updatedFeed;
        updatedFeed = await ResourceFeedsModel.findByIdAndUpdate(feedId, updateData, { new: true });
        if (!updatedFeed) {
            return sendResponse(500, false, "Failed to Update Feed", null, res);
        }
        updatedFeed = await ResourceFeedsModel.findById(feedId)
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
        const commentsCount = await FeedCommentModel.find({ postID: feedId }).countDocuments();
        updatedFeed.likesCount = updatedFeed.likes.length;
        updatedFeed.commentCount = commentsCount;
        updatedFeed.liked = !alreadyLiked;

        return sendResponse(200, true, "Feed Updated Successfully", updatedFeed, res);
    }
    catch (error) {
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

const getFeedController = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        console.log(req.query)
        const userId = req.user._id;

        const aggregationPipeline = [
            {
                $match: { approved: true, block: false }
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
                                liked: { $in: [userId, "$likes"] }
                            }
                        },
                        // {
                        //     $lookup: {
                        //         from: 'feed_comments',
                        //         let: { postId: '$_id' },
                        //         pipeline: [
                        //             { $match: { $expr: { $eq: ["$postID", "$$postId"] } } },
                        //             { $count: "commentCount" }
                        //         ],
                        //         as: 'commentData'
                        //     }
                        // },
                        // {
                        //     $addFields: {
                        //         commentCount: { $ifNull: [{ $arrayElemAt: ["$commentData.commentCount", 0] }, 0] }
                        //     }
                        // },
                        {
                            $project: {
                                category: 1,
                                content: 1,
                                likesCount: 1,
                                createdAt: 1,
                                media: 1,
                                public: 1,
                                liked: 1,
                                likes: 1,
                                title: 1,
                                // commentCount: 1,
                                "user.username": 1,
                                "user.imageUrl": 1,
                                "user.name": 1
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

        const result = await ResourceFeedsModel.aggregate(aggregationPipeline).exec();
        // Debugging output

        const totalFeeds = result[0]?.metadata || 0;
        const totalPages = Math.ceil(totalFeeds / limit);
        const feeds = result[0]?.data || [];
        console.log({
            feeds,
            totalFeeds,
            totalPages,
            currentPage: parseInt(page)
        })
        if (feeds.length === 0) {
            return sendResponse(200, false, "No Feeds Found", {
                feeds,
                totalFeeds,
                totalPages,
                currentPage: parseInt(page)
            }, res);
        }

        return sendResponse(200, true, "Feeds Fetched Successfully", {
            feeds,
            totalFeeds,
            totalPages,
            currentPage: parseInt(page)
        }, res);
    } catch (error) {
        console.error("Error while getting feeds: ", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

// const addCommentOnFeedController = async (req, res) => {
//     try {
//         const { user_id } = sanitizeData(req.userToken);
//         const data = sanitizeData(req.body);

//         if (!data.message || data.message.trim() === "") {
//             return sendResponse(400, false, "Message Not Found", null, "Message content is required", res);
//         }

//         if (!mongoose.Types.ObjectId.isValid(data.feedId)) {
//             return sendResponse(400, false, "Invalid Feed ID", null, "Provided feed ID is not valid", res);
//         }

//         const user = await UserModel.findOne({ firebaseAuthId: user_id });
//         if (!user) {
//             return sendResponse(404, false, "User Not Found", null, "Invalid Firebase token", res);
//         }

//         if (user.block) {
//             return sendResponse(403, false, "Cannot Comment on Feed", null, "User is blocked", res);
//         }

//         const newComment = {
//             userId: user._id,
//             message: data.message.trim(),
//         };

//         const feed = await ResourceFeedsModel.findByIdAndUpdate(
//             data.feedId,
//             { $push: { comments: newComment } },
//             { new: true }
//         );

//         if (!feed) {
//             return sendResponse(404, false, "Feed Does Not Exist", null, "Feed ID does not exist", res);
//         }

//         return sendResponse(200, true, "Comment Added Successfully", newComment, null, res);
//     }
//     catch (error) {
//         console.error("Error while adding comment on feed: ", error);
//         return sendResponse(500, false, "Internal Server Error", null, error.message, res);
//     }
// };

const addLikeOnFeedController = async (req, res) => {
    try {
        const { user_id } = sanitizeData(req.userToken);
        const { feedId } = sanitizeData(req.params);

        if (!mongoose.Types.ObjectId.isValid(feedId)) {
            return sendResponse(400, false, "Invalid Feed ID", null, res);
        }

        const feed = await ResourceFeedsModel.findById(feedId);
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
            await ResourceFeedsModel.findByIdAndUpdate(feedId, { $pull: { likes: user._id } });
        } else {
            await ResourceFeedsModel.findByIdAndUpdate(feedId, { $push: { likes: user._id } });
            await NotificationModel.create({
                from: user._id,
                to: feed.userId,
                title: `@${user.username} liked your resource`,
                timestamp: Date.now(),
                description: `@${user.username} liked your resource`,
                post: feed._id,
                type: "resource-like"
            })
        }
        updatedFeed = await ResourceFeedsModel.findById(feedId)
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
        const commentsCount = await FeedCommentModel.find({ postID: feedId }).countDocuments();
        updatedFeed.likesCount = updatedFeed.likes.length;
        updatedFeed.commentCount = commentsCount;
        updatedFeed.liked = !alreadyLiked;

        return sendResponse(200, true, `Like ${alreadyLiked ? "Removed" : "Added"} Successfully`, updatedFeed, res);
    } catch (error) {
        console.error("Error while adding/removing like on feed:", error);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

// const deleteFeedController = async (req, res) => {
//     try {
//         const { feedId } = sanitizeData(req.params);
//         const { user_id } = sanitizeData(req.userToken);

//         if (!mongoose.Types.ObjectId.isValid(feedId)) {
//             return sendResponse(400, false, "Invalid Feed ID", null, res);
//         }

//         const feed = await FeedsModel.findById(feedId);
//         if (!feed) {
//             return sendResponse(404, false, "Feed Not Found", null, res);
//         }

//         const user = await UserModel.findOne({ firebaseAuthId: user_id });
//         if (!user) {
//             return sendResponse(404, false, "User Not Found", null, res);
//         }

//         if (feed.userId.toString() !== user._id.toString()) {
//             return sendResponse(403, false, "Access Denied", null, res);
//         }

//         const deletedFeed = await FeedsModel.findByIdAndDelete(feedId);
//         if (!deletedFeed) {
//             return sendResponse(500, false, "Failed to Delete Feed", null, "An error occurred while deleting the feed", res);
//         }

//         return sendResponse(200, true, "Feed Deleted Successfully", null, null, res);
//     }
//     catch (error) {
//         console.error("Error while deleting feed:", error);
//         return sendResponse(500, false, "Internal Server Error", null, error.message, res);
//     }
// }

// const blockFeedController = async (req, res) => {
//     try {
//         const { feedId } = sanitizeData(req.params);
//         const { blockStatus } = sanitizeData(req.body);

//         if (typeof blockStatus !== 'boolean') {
//             return sendResponse(400, false, "Invalid Block Status", null, "blockStatus must be a boolean", res);
//         }

//         const blockFeed = await FeedsModel.findByIdAndUpdate(
//             feedId,
//             { block: blockStatus },
//             { new: true }
//         );
//         if (!blockFeed) {
//             return sendResponse(404, false, "Feed Not Found", null, "No Feed found with the provided FeedId", res);
//         }

//         return sendResponse(200, true, "Feed's Block Status Updated Successfully", blockFeed, null, res);
//     }
//     catch (error) {
//         console.error("Error while blocking Feed:", error.message);
//         return sendResponse(500, false, "Internal Server Error", null, error.message, res);
//     }
// };

module.exports = {
    createFeedController,
    updateFeedController,
    getFeedController,
    addLikeOnFeedController
};