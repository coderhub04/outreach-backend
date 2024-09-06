const mongoose = require("mongoose");

const followingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,    
    },
    follower: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    }
});

const FollowingModel = mongoose.model("following", followingSchema);

module.exports = FollowingModel;