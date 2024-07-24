const mongoose = require("mongoose");

const ForumFeedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "users",
        required: true
    },
    forum: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "forums",
        required: true
    },
    public: {
        type: Boolean,
        required: true,
        default: false,
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
    block: {
        type: Boolean,
        default: false,  
    },
    timestamp: {
        type: Number,
        required: true,
        default: Date.now()
    },
}, {
    timestamps: true 
});

const ForumFeedModel = mongoose.model("forum_feeds", ForumFeedSchema);

module.exports = ForumFeedModel
