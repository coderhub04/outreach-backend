const ForumModel = require('../../models/ForumModel');
const UserModel = require('../../models/UserModel');
const sendResponse = require('../../utils/response');

const listUsers = async (req, res) => {
	try {
		const users = await UserModel.find();
		return sendResponse(200, true, 'Users fetched', users, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const getUserById = async (req, res) => {
	try {
		const user = await UserModel.findOne({ _id: req.params._id });
		return sendResponse(200, true, 'User fetched', user, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const disableUser = async (req, res) => {
	try {
		const user = await UserModel.findByIdAndUpdate(req.params._id);
		const updatedUser = await UserModel.findByIdAndUpdate(req.params._id, {
			block: !user.block
		}, {
			returnOriginal: false
		});
		return sendResponse(200, true, 'Success', updatedUser, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

module.exports = {
	listUsers,
	getUserById,
	disableUser
}
