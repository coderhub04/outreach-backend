const FollowingModel = require("../models/FollowingModel");
const UserModel = require("../models/UserModel");
const sendResponse = require("../utils/response");
const sanitizeData = require("../utils/sanitizeData");
const mongoose = require("mongoose");

const followUser = async (req, res) => {
	try {
		const { userId, id } = req.params

		if (!id) {
			return sendResponse(400, false, "User ID Missing", null, "userId is required", res);
		}

		const user = await UserModel.findOne({ _id: id });

		if (!user) {
			return sendResponse(404, false, "User Not Found", null, "User with the provided ID does not exist", res);
		}
		const isFollowing = await FollowingModel.findOne({
			userId: user._id,
			follower: userId
		})
		if (isFollowing) {
			await FollowingModel.findOneAndDelete({
				userId: user._id,
				follower: userId
			})
		} else {
			const newFollowing = new FollowingModel({
				userId: user._id,
				follower: userId
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