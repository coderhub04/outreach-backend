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
		const forumPosts = await ForumFeedModel.find({forum: req.params._id}).populate('userId').populate('forum');
		return sendResponse(200, true, 'Forum Post Fetched', forumPosts, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}


module.exports = {
	createForum,
	getForum,
	joinForum,
	leaveForum,
	createForumPost,
	getForumPost
}
