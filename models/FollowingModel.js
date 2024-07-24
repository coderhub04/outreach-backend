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

const followingModel = mongoose.model("following", followingSchema);

module.exports = {
    followingModel,
};