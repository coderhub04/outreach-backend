const admin = require("../utils/firebaseAdmin");
const UserModel = require("../models/UserModel");
const sendResponse = require("../utils/response");

const userBlockStatus = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendResponse(401, false, "Unauthorized: No Token Found", null, res);
    }

    const idToken = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        const user = await UserModel.findOne({ firebaseAuthId: decodedToken.user_id });
        if (!user) {
            return sendResponse(404, false, "No user Found", null, res);
        }

        const data = {
            blockStatus: user.block,
        };

        return sendResponse(200, true, "Block Status Fetched", data, res);
    }
    catch (error) {
        console.error('Error verifying ID token:', error);
        return sendResponse(401, false, "Unauthorized: Invalid Token", null, res);
    }
}

module.exports = userBlockStatus;