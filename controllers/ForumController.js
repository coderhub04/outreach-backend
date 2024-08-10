const { default: mongoose } = require('mongoose');
const ForumFeedModel = require('../models/ForumFeedModel');
const ForumModel = require('../models/ForumModel');
const sendResponse = require('../utils/response');

const createForum = async (req, res) => {
	try {
		const newForum = new ForumModel({...req.body, userId: req.user});
		const savedForum = await newForum.save()
		return sendResponse(200, true, 'Forum created', savedForum, res);
	} catch (error) {
		console.log(error)
		return sendResponse(500, false, error.message, null, res);
	}
}

const getForum = async (req, res) => {
	try {
		const forums = await ForumModel.find().populate('userId');
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
		const forumPost  = new ForumFeedModel({...req.body, userId: req.user._id, forum: req.params._id});
		const savedForumPost = await forumPost.save();
		const savedPost = await ForumFeedModel.findById(savedForumPost._id).populate("userId")
		return sendResponse(200, true, 'Forum Post created!', savedPost, res);
	} catch (error) {
		console.log(error)
		return sendResponse(500, false, error.message, null, res);
	}
}

const getForumPost = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
		console.log(req.params)
        const forumId = req.params._id;

        const aggregationPipeline = [
            {
                $match: {
                    forum: new mongoose.Types.ObjectId(forumId)
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

		console.log(200, true, "Forum Posts Fetched Successfully", JSON.stringify({
            forumPosts,
            totalPosts,
            totalPages,
            currentPage: parseInt(page)
        }))

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

module.exports = {
	createForum,
	getForum,
	joinForum,
	leaveForum,
	createForumPost,
	getForumPost
}
