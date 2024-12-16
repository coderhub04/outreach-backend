const FeedsModel = require('../../models/FeedsModel');
const ReportModel = require('../../models/ReportModel');
const sendResponse = require('../../utils/response');

const listPosts = async (req, res) => {
	try {
		const posts = await FeedsModel.find().populate('userId', 'imageUrl username email name')
		return sendResponse(200, true, 'Posts fetched', posts, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const reportedPosts = async (req, res) => {
	try {
		const reportedPosts = await ReportModel.aggregate([
            { $match: { type: "post",} },
            {
                $lookup: {
                    from: "feeds",
                    localField: "post",
                    foreignField: "_id",
                    as: "postDetails",
                },
            },
            { $unwind: "$postDetails" },
            {
                $lookup: {
                    from: "users",
                    localField: "postDetails.userId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    _id: "$postDetails._id",
                    userId: {
                        _id: "$userDetails._id",
                        email: "$userDetails.email",
                        name: "$userDetails.name",
                        username: "$userDetails.username",
                        imageUrl: "$userDetails.imageUrl",
                    },
                    public: "$postDetails.public",
                    content: "$postDetails.content",
                    media: "$postDetails.media",
                    likes: "$postDetails.likes",
                    block: "$postDetails.block",
                    timestamp: "$postDetails.timestamp",
                    createdAt: "$postDetails.createdAt",
                    updatedAt: "$postDetails.updatedAt",
                    deleted: "$postDetails.deleted",
                },
            },
        ]);

		return sendResponse(200, true, 'Posts fetched', reportedPosts, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const getPostById = async (req, res) => {
	try {
		const post = await FeedsModel.findOne({ _id: req.params._id }).populate({
			path: "userId",
			select: "name username imageUrl _id email",
			model: "users",
			options: {
				virtuals: true,
				justOne: true,
				virtualName: 'user'
			}
		})
		const reports = await ReportModel.find({ type: "post", post: post._id }).populate({
			path: "user",
			select: "name username imageUrl _id email",
			model: "users",
			options: {
				virtuals: true,
				justOne: true,
				virtualName: 'user'
			}
		})
		return sendResponse(200, true, 'Post fetched', { ...post.toObject(), media: post.media.toObject(), reports }, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const disablePost = async (req, res) => {
	try {
		const post = await FeedsModel.findByIdAndUpdate(req.params._id);
		const updatedPost = await FeedsModel.findByIdAndUpdate(req.params._id, {
			block: !post.block
		}, {
			returnOriginal: false
		}).populate({
			path: "userId",
			select: "name username imageUrl _id email",
			model: "users",
			options: {
				virtuals: true,
				justOne: true,
				virtualName: 'user'
			}
		})
		return sendResponse(200, true, 'Success', updatedPost, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}


module.exports = {
	listPosts,
	getPostById,
	disablePost,
	reportedPosts
}
