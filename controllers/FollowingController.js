const FollowingModel = require("../models/FollowingModel");
const UserModel = require("../models/UserModel");
const sendResponse = require("../utils/response");
const sanitizeData = require("../utils/sanitizeData");
const mongoose = require("mongoose");

const followUser = async (req, res) => {
	try {
		const data = sanitizeData(req.body);
		const { user_id } = sanitizeData(req.userToken);
		const { id } = req.params

		if (!user_id) {
			return sendResponse(400, false, "User ID Missing", null, "userId is required", res);
		}

		const user = await UserModel.findOne({ firebaseAuthId: user_id });

		if (!user) {
			return sendResponse(404, false, "User Not Found", null, "User with the provided ID does not exist", res);
		}
		const isFollowing = await FollowingModel.findOne({
			userId: user._id,
			follower: id
		})
		if (isFollowing) {
			await FollowingModel.findOneAndDelete({
				userId: user._id,
				follower: id
			})
		} else {
			const newFollowing = new FollowingModel({
				userId: user._id,
				follower: id
			});
			await newFollowing.save();
		}
		return sendResponse(201, true, "Help & Support Request Registered Successfully", null, res);
	}
	catch (error) {
		return sendResponse(500, false, "Internal Server Error", null, res);
	}
};


module.exports = {
	followUser,
};