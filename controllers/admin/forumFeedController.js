const ForumFeedModel = require('../../models/ForumFeedModel');
const ReportModel = require('../../models/ReportModel');
const sendResponse = require('../../utils/response');

const getForumPosts = async (req, res) => {
	try {
		const forumPosts = await ForumFeedModel.find().populate('userId', 'imageUrl username email name');
		return sendResponse(200, true, 'Forum posts fetched', forumPosts, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const getForumPostById = async (req, res) => {
	try {
		const forumPost = await ForumFeedModel.findOne({ _id: req.params._id }).populate('userId', 'imageUrl username email name');
		const reports = await ReportModel.find({ type: "forum", post: forumPost._id }).populate({
			path: "user",
			select: "name username imageUrl _id email",
			model: "users",
			options: {
				virtuals: true,
				justOne: true,
				virtualName: 'user'
			}
		})
		return sendResponse(200, true, 'Forum post fetched',  { ...forumPost.toObject(), media: forumPost.media.toObject(), reports }, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const disableForumPost = async (req, res) => {
	try {
		const forumPost = await ForumFeedModel.findById(req.params._id);
		const forumPostUpdated = await ForumFeedModel.findByIdAndUpdate(req.params._id, {
			disabled: !forumPost.disabled
		});
		return sendResponse(200, true, 'Success', forumPostUpdated, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

module.exports = {
	getForumPosts,
	getForumPostById,
	disableForumPost
}
