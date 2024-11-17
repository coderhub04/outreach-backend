const ForumModel = require('../../models/ForumModel');
const sendResponse = require('../../utils/response');

const getForum = async (req, res) => {
	try {
		const forums = await ForumModel.find().populate('userId', 'imageUrl username email name');
		return sendResponse(200, true, 'Forum fetched', forums, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const getForumById = async (req, res) => {
	try {
		const forum = await ForumModel.findOne({_id: req.params._id}).populate('userId', 'imageUrl username email name');
		return sendResponse(200, true, 'Forum fetched', forum, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const updateForum = async (req, res) => {
	try {
		const forumUpdated = await ForumModel.findByIdAndUpdate(req.params._id, req.body);
		const forum = await ForumModel.findById(forumUpdated._id).populate('userId', 'imageUrl username email name');
		return sendResponse(200, true, 'Forum Updated', forum, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const deleteForum = async (req, res) => {
	try {
		const forum = await ForumModel.findById(req.params._id);
		const forumUpdated = await ForumModel.findByIdAndUpdate(req.params._id, {
			deleted: !forum.deleted
		});
		return sendResponse(200, true, 'Success', forumUpdated, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const disableForum = async (req, res) => {
	try {
		const forum = await ForumModel.findById(req.params._id);
		const forumUpdated = await ForumModel.findByIdAndUpdate(req.params._id, {
			disabled: !forum.disabled
		});
		return sendResponse(200, true, 'Success', forumUpdated, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

module.exports = {
	getForum,
	updateForum,
	deleteForum,
	disableForum,
	getForumById
}
