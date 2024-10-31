const mongoose = require("mongoose");

const ResourceFeedsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "users",
        required: true
    },
    content: {
        type: String,
        default: "",
    },
    media: {
        type: [Map],
        default: [],
    },
    likes: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: "users",
        default: [],
    },
    timestamp: {
        type: Number,
        required: true,
        default: Date.now()
    },
	category: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true,
		ref: "resource_category"
	},
    approved: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true
    }
}, {
    timestamps: true 
});

const ResourceFeedsModel = mongoose.model("resource_feeds", ResourceFeedsSchema);

module.exports = ResourceFeedsModel
