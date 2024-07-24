const UserModel = require("../models/UserModel");
const admin = require("../utils/firebaseAdmin");
const sendResponse = require('../utils/response')

const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendResponse(401, false, "Unauthorized: No Token Found", null, res);
    }

    const idToken = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.user_id;
        const user = await UserModel.findOne({ firebaseAuthId: userId });

        if (!user || user.length === 0) {
            return sendResponse(401, false, "Unauthorized: Invalid token", null, res);
        }
        req.userToken = decodedToken;
        next();
    }
    catch (error) {
        console.error('Error verifying ID token:', error);
        return sendResponse(401, false, "Unauthorized: Invalid token", null, res);
    }
}

module.exports = verifyFirebaseToken