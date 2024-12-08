const FeedsModel = require('../../models/FeedsModel');
const ReportModel = require('../../models/ReportModel');
const sendResponse = require('../../utils/response');

const listPosts = async (req, res) => {
	try {
		const posts = await FeedsModel.find().populate({
			path: "userId",
			select: "name username imageUrl _id email",
			model: "users",
			options: {
				virtuals: true,
				justOne: true,
				virtualName: 'user'
			}
		})
		return sendResponse(200, true, 'Posts fetched', posts, res);
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
		return sendResponse(200, true, 'Post fetched', { ...post.toObject(), reports }, res);
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
		}).populate("category");
		return sendResponse(200, true, 'Success', updatedPost, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}


module.exports = {
	listPosts,
	getPostById,
	disablePost
}
