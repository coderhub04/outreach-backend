const mongoose = require("mongoose");
const MediaSchema = require("./MediaModel");

const StorySchema = new mongoose.Schema({
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
        type: MediaSchema,
    },
    timestamp: {
        type: Number,
        required: true,
        default: Date.now()
    },
    deleted: {
        type: Boolean,
        default: false
    },
    public: {
        type: Boolean,
        required: true,
        default: false,
    },
}, {
    timestamps: true
});

const StoryModel = mongoose.model("stories", StorySchema);

module.exports = StoryModel
