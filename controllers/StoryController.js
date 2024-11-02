const FollowingModel = require("../models/FollowingModel");
const StoryModel = require("../models/StoryModel");
const UserModel = require("../models/UserModel");
const sendResponse = require("../utils/response");
const sanitizeData = require("../utils/sanitizeData");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const createStory = async (req, res) => {
	try {
		const data = sanitizeData(req.body);
		const { user_id } = sanitizeData(req.userToken);

		if (!user_id) {
			return sendResponse(400, false, "User ID Missing", null, res);
		}

		const user = await UserModel.findOne({ firebaseAuthId: user_id });

		if (!user) {
			return sendResponse(404, false, "User Not Found", null, res);
		}

		const storyData = {
			...data,
			userId: user._id,
		};

		const createStory = new StoryModel(storyData);
		const savedStory = await createStory.save();
		return sendResponse(201, true, "Story Uploaded Successfully", savedStory, res);
	}
	catch (error) {
		console.error("Error while posting story", error);
		return sendResponse(500, false, "Error while posting story", error.message, res);
	}
};

const getStories = async (req, res) => {
	try {
		const data = sanitizeData(req.body);
		const { user_id } = sanitizeData(req.userToken);

		if (!true) {
			return sendResponse(400, false, "User ID Missing", null, res);
		}

		const user = await UserModel.findOne({ firebaseAuthId: user_id });

		if (!user) {
			return sendResponse(404, false, "User Not Found", null, res);
		}

		const connectedUsers = await FollowingModel.aggregate([
			{
				$match: {
					$or: [
						{ follower: user._id },
						{ userId: user._id }
					]
				}
			},
			{
				$project: {
					relatedUserId: {
						$cond: {
							if: { $eq: ["$userId", user._id] },
							then: "$follower",
							else: "$userId"
						}
					}
				}
			},
			{
				$group: {
					_id: null,
					userIds: { $addToSet: "$relatedUserId" }
				}
			},
			{
				$project: {
					_id: 0,
					userIds: 1
				}
			}
		])
		let stories = [];
		if (connectedUsers && connectedUsers[0] && connectedUsers[0].userIds) {
			stories = await StoryModel.find({
				userId: { $in: connectedUsers[0].userIds },
				deleted: false
			})
				.sort({ timestamp: -1 }).populate({
					path: "userId",
					select: "name username imageUrl",
					model: "users",
					options: {
						virtuals: true,
						justOne: true,
						virtualName: 'user'
					}
				});
		}
		const ownStory = await StoryModel.find({
			userId: user._id,
			deleted: false
		})
			.sort({ timestamp: -1 }).populate({
				path: "userId",
				select: "name username imageUrl",
				model: "users",
				options: {
					virtuals: true,
					justOne: true,
					virtualName: 'user'
				}
			});
		return sendResponse(200, true, "Story Fetched Successfully", { own: ownStory, user: stories, }, res);
	}
	catch (error) {
		console.error("Error while posting story", error);
		return sendResponse(500, false, "Error while fetching story", error.message, res);
	}
};

const deleteStory = async (req, res) => {
	try {
		const data = sanitizeData(req.body);
		const { storyID } = req.params
		const { user_id } = sanitizeData(req.userToken);

		if (!user_id) {
			return sendResponse(400, false, "User ID Missing", null, res);
		}

		const user = await UserModel.findOne({ firebaseAuthId: user_id });

		if (!user) {
			return sendResponse(404, false, "User Not Found", null, res);
		}

		const deletedStory = await StoryModel.findByIdAndUpdate(storyID, {
			deleted: true
		})
		return sendResponse(200, true, "Story Deleted Successfully", deletedStory, res);
	}
	catch (error) {
		console.error("Error while posting story", error);
		return sendResponse(500, false, "Error while deleting story", error.message, res);
	}
};


module.exports = {
	createStory,
	getStories,
	deleteStory,
};