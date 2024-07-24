const HelpAndSupportModel = require("../models/HelpAndSupportModel");
const UserModel = require("../models/UserModel");
const sendResponse = require("../utils/response");
const sanitizeData = require("../utils/sanitizeData");
const mongoose = require("mongoose");

const registerHelpRequestController = async (req, res) => {
    try {
        const data = sanitizeData(req.body);
        const { user_id } = sanitizeData(req.userToken);

        if (!user_id) {
            return sendResponse(400, false, "User ID Missing", null, "userId is required", res);
        }

        const user = await UserModel.findOne({ firebaseAuthId: user_id });

        if (!user) {
            return sendResponse(404, false, "User Not Found", null, "User with the provided ID does not exist", res);
        }

        const registerData = {
            ...data,
            userId: user._id,
        };

        const registerRequest = new HelpAndSupportModel(registerData);
        await registerRequest.save();
        return sendResponse(201, true, "Help & Support Request Registered Successfully", registerRequest, null, res);
    } 
    catch (error) {
        console.error("Error while registering help & support request:", error);
        return sendResponse(500, false, "Internal Server Error", null, error.message, res);
    }
};

const getHelpRequestController = async(req, res) => {
    try {
        const data = await HelpAndSupportModel.find();

        if(!data) {
            return sendResponse(204, true, "No Data Found", null, null, res);
        }

        sendResponse(200, true, "Data Fetched Successfully", data, null, res);
    }
    catch(error) {
        console.error("Error while getting help & support request: ", error.message);
        return sendResponse(500, false, "Internal Server Error", null, error.message, res);
    }
}

const getHelpRequestByUserController = async(req, res) => {
    try {
        const {id} = sanitizeData(req.params);
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendResponse(400, false, "Invalid User Id", null, "Provided userId is not a valid ObjectId", res);
        }

        const data = await HelpAndSupportModel.find({ userId: id });

        if(!data) {
            return sendResponse(204, true, "No Data Found for user", null, null, res);
        }

        sendResponse(200, true, "Data Fetched Successfully", data, null, res);
    }
    catch(error) {
        console.error("Error while getting help & support request: ", error.message);
        return sendResponse(500, false, "Internal Server Error", null, error.message, res);
    }
};

module.exports = {
    registerHelpRequestController,
    getHelpRequestByUserController,
    getHelpRequestController,
};