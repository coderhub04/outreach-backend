const mongoose = require("mongoose");

const HelpAndSupportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email address.'],
    },
    message: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
});

const HelpAndSupportModel = mongoose.model("helps_and_supports", HelpAndSupportSchema);

module.exports = HelpAndSupportModel