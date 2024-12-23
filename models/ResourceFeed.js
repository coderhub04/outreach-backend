const mongoose = require("mongoose");
const MediaSchema = require("./MediaModel");

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
        type: [MediaSchema],
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
    block: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const ResourceFeedsModel = mongoose.model("resource_feeds", ResourceFeedsSchema);

module.exports = ResourceFeedsModel
