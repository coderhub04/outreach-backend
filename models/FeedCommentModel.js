const mongoose = require('mongoose');

const feedCommentSchema = new mongoose.Schema({
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
    parentID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'comments',
    },
    postID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'feeds'
    }
});

const FeedCommentModel = mongoose.model('feed_comments', feedCommentSchema);

module.exports = FeedCommentModel;
