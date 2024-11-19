const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    user: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "users",
		required: true
	},
	post: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true
	},
	closed: {
		type: Boolean,
		default: false
	},
	description: {
		type: String,
		required: false
	},
	type: {
		type: String,
		required: true,
		enum: ["resource", "post", "forum"]
	}
});

const ReportModel = mongoose.model("reports", ReportSchema);

module.exports = ReportModel;