const mongoose = require('mongoose');

const forumFeedCommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "users",
        required: true,
    },
    createdAt: {
        type: Number,
        default: Date.now(),
    },
    postID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'forum_feeds'
    },
    likes: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'users'
    }
});

const ForumFeedCommentModel = mongoose.model('forum_feed_comments', forumFeedCommentSchema);

module.exports = ForumFeedCommentModel;
