const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firebaseAuthId: {
        type: String,
        required: true,
        unique: true,
    },
    isProfileCompleted: {
        type: Boolean,
        default: false,
    },
    provider: {
        type: String,
        required: true,
    },
    login: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Invalid Email",
        },
    },
    username: {
        type: String,
        match: [/^[a-z]{6,20}$/, 'Invalid Username, It should contain only lowercase letters and should be 6-20 characters long.'],
    },
    imageUrl: {
        type: String,
    },
    bio: String,
    interest: {
        type: [String],
        default: [],
    },
    rewardPoints: {
        type: Number,
        default: 0,
    },
    block: {
        type: Boolean,
        default: false,
    },
    fcmToken: {
        type: String,
    }
}, {timestamps: true});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel