const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    _id: false
});

module.exports = MediaSchema
