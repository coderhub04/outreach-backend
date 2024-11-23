const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: false
	},
	to: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "users",
		required: true
	},
	from: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "users",
		required: true
	},
	post: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true
	},
	type: {
		type: String,
	},
	timestamp: {
		type: Number,
		required: true,
		default: Date.now()
	}
});

const NotificationModel = mongoose.model("notifications", NotificationSchema);

module.exports = NotificationModel;