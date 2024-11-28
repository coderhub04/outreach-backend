const sendResponse = require("../utils/response");
const NotificationModel = require("../models/NotificationModel");
const { getMessaging } = require("firebase-admin/messaging");
const UserModel = require("../models/UserModel");


const createNotification = async (req, res) => {
	try {
		const newNotification = new NotificationModel(req.body);
		const savedNotification = await newNotification.save();
		return sendResponse(201, true, "Notification Created Successfully", savedNotification, res);
	} catch (error) {
		return sendResponse(500, false, "Internal Server Error", null, res);
	}
}

const getUserNotifications = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = 20;

		const skip = (page - 1) * limit;

		const notifications = await NotificationModel.find({ to: req.params.userID })
			.sort({ timestamp: -1 })
			.skip(skip)
			.limit(limit)
			.populate('to from', '_id username name email imageUrl');

		const totalNotifications = await NotificationModel.countDocuments({ to: req.params.userID });

		const response = {
			notifications,
			totalNotifications,
			page,
			limit,
			totalPages: Math.ceil(totalNotifications / limit),
		};

		return sendResponse(200, true, "Notifications fetched successfully", response, res);
	} catch (error) {
		return sendResponse(500, false, "Internal Server Error", null, res);
	}
};

const sendNotificationUsingFCM = async (req, res) => {
	try {
		const user = await UserModel.findById(req.params._id);
		if (!user) return sendResponse(404, false, "User not found", null, res);
		if (user.fcmToken) {
			getMessaging().send({
				android: {
					priority: "high",
					notification: {
						sound: "alert",
						channelId: "com.outreach.social.outreach_notification_channel_id",
						defaultLightSettings: true,
						tag: user._id
					}
				},
				notification: {
					title: req.body.title,
					body: req.body.desc,
					imageUrl: req.body.imageUrl,
				},
				token: user.fcmToken,
				data: req.body.data
			})
				.then(async (response) => {
					return sendResponse(200, true, "Notification sent!", null, res);
				}).catch((err) => {
					return sendResponse(500, false, err.message, null, res);
				})
		} else {
			return sendResponse(404, false, "No token found", null, res);
		}
	} catch (error) {
		return sendResponse(500, false, "Internal Server Error", null, res);
	}
}

const sendMessageNotificationUsingFCM = async (req, res) => {
	try {
		const user = await UserModel.findById(req.params._id);
		if (!user) return sendResponse(404, false, "User not found", null, res);
		if (user.fcmToken) {
			getMessaging().send({
				android: {
					priority: "high",
					notification: {
						sound: "alert",
						channelId: "com.outreach.social.outreach_notification_channel_id",
						defaultLightSettings: true,
						tag: user._id
					}
				},
				notification: {
					title: `Message from ${user.name}`,
					body: req.body.msg,
				},
				token: user.fcmToken,
				data: req.body.data
			})
				.then(async (response) => {
					return sendResponse(200, true, "Notification sent!", null, res);
				}).catch((err) => {
					return sendResponse(500, false, err.message, null, res);
				})
		} else {
			return sendResponse(404, false, "No token found", null, res);
		}
	} catch (error) {
		return sendResponse(500, false, "Internal Server Error", null, res);
	}
}



module.exports = {
	createNotification,
	getUserNotifications,
	sendNotificationUsingFCM,
	sendMessageNotificationUsingFCM
}