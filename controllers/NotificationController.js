const sendResponse = require("../utils/response");
const NotificationModel = require("../models/NotificationModel");


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




module.exports = {
	createNotification,
	getUserNotifications
}