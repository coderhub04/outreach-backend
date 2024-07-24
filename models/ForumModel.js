const mongoose = require("mongoose");

const ForumSchema = new mongoose.Schema({
	userId: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "users",
		required: true
	},
	public: {
		type: Boolean,
		required: true,
		default: false,
	},
	name: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true
	},
	description: {
		type: String,
		default: false,
	},
	timestamp: {
		type: Number,
		required: true,
		default: Date.now()
	},
	image: {
		type: String,
		required: true,
	},
	joined: {
		type: [mongoose.SchemaTypes.ObjectId],
		ref: "users",
		default: [],
	}
}, {
	timestamps: true
});

const ForumModel = mongoose.model("forums", ForumSchema);

module.exports = ForumModel
