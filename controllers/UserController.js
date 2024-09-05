const sendResponse = require("../utils/response");
const UserModel = require("../models/UserModel");
const FeedsModel = require("../models/FeedsModel");
const sanitizeData = require("../utils/sanitizeData");
const mongoose = require("mongoose");

const registerUserController = async (req, res) => {
    try {
        const data = sanitizeData(req.body);
        const { user_id, email, firebase: { sign_in_provider } } = sanitizeData(req.userToken);

        const existingUser = await UserModel.findOne({ email: req.body.email });
        if (existingUser) {
            return sendResponse(400, false, "Email Already Exists", null, res);
        }

        const userData = {
            ...data,
            firebaseAuthId: user_id,
            provider: sign_in_provider,
            email: email
        };

        const newUser = new UserModel(userData);
        await newUser.save();
        return sendResponse(201, true, "User Created Successfully", null, res);
    }
    catch (error) {
        console.error("Error while registering user: ", error.message);
        if (error && error.code === 11000) {
            let errorMessage = "Duplicate Data";
            if (error.keyPattern) {
                const key = Object.keys(error.keyPattern)[0];
                errorMessage = `${key.charAt(0).toUpperCase() + key.slice(1)} Already Exists`;
            }
            return sendResponse(400, false, errorMessage, null, res);
        }
        else {
            return sendResponse(500, false, "Internal Server Error", null, res);
        }
    }
};

const updateUserController = async (req, res) => {
    try {
        const { user_id } = sanitizeData(req.userToken);
        const data = sanitizeData(req.body.updateData);

        const user = await UserModel.findOne({ firebaseAuthId: user_id });
        if (!user) {
            return sendResponse(404, false, "User Not Found", null, res);
        }

        if (user.block) {
            return sendResponse(403, false, "Cannot update the data", null, res);

        }

        const updateData = await UserModel.findByIdAndUpdate(user._id, data, { new: true });

        if (!updateData) {
            return sendResponse(404, false, "User Not Found", null, res);
        }
        return sendResponse(200, true, "User Details Updated Successfully", updateData, res);
    }
    catch (error) {
        console.error("Error while updating user: ", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
}

const getUserProfileController = async (req, res) => {
    try {
        const { id } = sanitizeData(req.params);

        const user = await UserModel.findById(id, { token: 0 });
        if (!user) {
            return sendResponse(204, true, "No Data Found", null, res);
        }

        const feeds = await FeedsModel.find({ userId: id }).sort({ createdAt: -1 }).limit(3);

        const [followersCount, followingCount] = await Promise.all([
            followingModel.countDocuments({ userId: id }),
            followingModel.countDocuments({ follower: id })
        ]);

        const userResponse = {
            ...user.toObject(),
            feeds,
            followers: followersCount,
            following: followingCount,
        };

        return sendResponse(200, true, "Data Fetched Successfully", userResponse, res);
    }
    catch (error) {
        console.error("Error while getting user profile:", error);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

const getCurrentProfileController = async (req, res) => {
    try {
        const { user_id } = sanitizeData(req.userToken);

        // Fetch user data without `firebaseAuthId`
        const user = await UserModel.findOne({ firebaseAuthId: user_id }, { firebaseAuthId: 0 });
        if (!user) {
            return sendResponse(204, true, "No Data Found", null, res);
        }

        const userId = user._id;

        // Fetch feeds with comment count
        const feeds = await FeedsModel.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId) }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    liked: { $in: [userId, "$likes"] }
                }
            },
            {
                $lookup: {
                    from: 'feed_comments',
                    let: { postId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$postID", "$$postId"] } } },
                        { $count: "commentCount" }
                    ],
                    as: 'commentData'
                }
            },
            {
                $addFields: {
                    commentCount: { $ifNull: [{ $arrayElemAt: ["$commentData.commentCount", 0] }, 0] }
                }
            },
            {
                $project: {
                    content: 1,
                    likesCount: 1,
                    createdAt: 1,
                    media: 1,
                    liked: 1,
                    public: 1,
                    commentCount: 1,
                    "user.username": 1,
                    "user.imageUrl": 1,
                    "user.name": 1
                }
            },
            {
                $limit: 3
            }
        ]);

        // Construct response
        const userResponse = {
            ...user.toObject(),
            feeds,
            followers: 0,
            following: 0,
        };

        return sendResponse(200, true, "Data Fetched Successfully", userResponse, res);
    } catch (error) {
        console.error("Error while getting current user profile:", error);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

const getAllUserController = async (req, res) => {
    try {
        const users = await UserModel.find().select("-token");
        if (!users) {
            return sendResponse(204, true, "No Data Found", null, res);
        }
        return sendResponse(200, true, "Data Fetched Successfully", users, res);
    }
    catch (error) {
        console.error("Error while getting all users", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
}

const blockUserController = async (req, res) => {
    try {
        const { userId } = sanitizeData(req.params);
        const { blockStatus } = sanitizeData(req.body);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return sendResponse(400, false, "Invalid User Id", null, res);
        }

        if (typeof blockStatus !== 'boolean') {
            return sendResponse(400, false, "Invalid Block Status", null, res);
        }

        const blockUser = await UserModel.findByIdAndUpdate(userId, { block: blockStatus }, { new: true });
        if (!blockUser) {
            return sendResponse(404, false, "User Not Found", null, res);
        }

        return sendResponse(200, true, "User Block Status Updated Successfully", blockUser, res);
    }
    catch (error) {
        console.error("Error while blocking user:", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

const followUserController = async (req, res) => {
    try {
        const { user_id } = sanitizeData(req.userToken);
        const { followUserId } = sanitizeData(req.params);

        if (!mongoose.Types.ObjectId.isValid(followUserId)) {
            return sendResponse(400, false, "Invalid Follow User Id", null, res);
        }

        const user = await UserModel.findOne({ firebaseAuthId: user_id });
        if (!user) {
            return sendResponse(400, false, "Invalid Firebase Token", null, res);
        }

        if (user._id.toString() === followUserId.toString()) {
            return sendResponse(400, false, "User cannot follow themselves", null, res);
        }

        const check = await followingModel.findOne({ userId: followUserId, follower: user._id });
        if (check) {
            return sendResponse(400, false, "Already Following", null, res);
        }

        const followId = await UserModel.findById(followUserId);
        if (!followId) {
            return sendResponse(400, false, "Follow User Id Does not exist", null, res);
        }

        const follow = new followingModel({ userId: followUserId, follower: user._id });
        await follow.save();

        return sendResponse(200, true, "Successfully followed the user", null, res);
    } catch (error) {
        console.error("Error in Following user:", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

const unFollowUserController = async (req, res) => {
    try {
        const { user_id } = sanitizeData(req.userToken);
        const { unFollowUserId } = sanitizeData(req.params);

        if (!mongoose.Types.ObjectId.isValid(unFollowUserId)) {
            return sendResponse(400, false, "Invalid Unfollow User Id", null, res);
        }

        const user = await UserModel.findOne({ firebaseAuthId: user_id });
        if (!user) {
            return sendResponse(400, false, "Invalid Firebase Token", null, res);
        }

        if (user._id === unFollowUserId) {
            return sendResponse(400, false, "User cannot unfollow themselves", null, res);
        }

        const followId = await UserModel.findById(unFollowUserId);
        if (!followId) {
            return sendResponse(400, false, "Invalid Unfollow User Id", null, res);
        }

        const unFollow = await followingModel.findOneAndDelete({ userId: unFollowUserId, follower: user._id });
        if (!unFollow) {
            return sendResponse(400, false, "Unfollow operation failed", null, res);
        }

        return sendResponse(200, true, "Successfully unfollowed the user", null, res);
    }
    catch (error) {
        console.error("Error in unfollowing user:", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

const userLoginController = async (req, res) => {
    try {
        const { user_id } = sanitizeData(req.userToken);
        const { login } = sanitizeData(req.body);

        const loginUser = UserModel.findOneAndUpdate(
            { firebaseAuthId: user_id },
            { login: login },
            { new: true }
        );

        if (!loginUser) {
            return sendResponse(400, false, "Invalid User Id in token", null, res);
        }

        return sendResponse(201, true, "Login Successfully", token, res);
    }
    catch (error) {
        console.error("Error while user login: ", error.message);
        return sendResponse(400, false, "Internal Server Error", null, res);
    }
}

const userSearchUsernameAndName = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return sendResponse(400, false, "Search query is required", null, res);
        }
        const users = await UserModel.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } }
            ]
        });
        if (!users || users.length === 0) {
            return sendResponse(204, true, "No Data Found", null, res);
        }
        return sendResponse(200, true, "Data Fetched Successfully", users, res);
    } catch (error) {
        console.error("Error while searching users:", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
}

const globalSearch = async (req, res) => {
    try {
        const { query, user } = req.query;
        const regexQuery = new RegExp(query, "i");
        if (!query) {
            return sendResponse(400, false, "Search query is required", null, res);
        }
        const users = await UserModel.find({
            $match: {
                $and: [
                    {
                        _id: { $ne: mongoose.Types.ObjectId(user) }
                    },
                    {
                        $or: [
                            { name: { $regex: regexQuery } },
                            { username: { $regex: regexQuery } }
                        ]
                    }
                ]
            }
        },
            {
                $project: {
                    name: 1,        
                    username: 1,    
                    imageUrl: 1,   
                    followers: 1,     
                    _id: 1,
                }
            },
            {
                $limit: 10
            });
        if (!users || users.length === 0) {
            return sendResponse(204, true, "No Data Found", null, res);
        }
        return sendResponse(200, true, "Data Fetched Successfully", users, res);
    } catch (error) {
        console.error("Error while searching users:", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
}

module.exports = {
    registerUserController,
    updateUserController,
    getUserProfileController,
    getAllUserController,
    blockUserController,
    followUserController,
    unFollowUserController,
    userLoginController,
    getCurrentProfileController,
    userSearchUsernameAndName,
    globalSearch
};