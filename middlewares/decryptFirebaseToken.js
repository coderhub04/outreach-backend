const admin = require("../utils/firebaseAdmin");
const UserModel = require("../models/UserModel");
const sendResponse = require("../utils/response");

const decryptFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Called")
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized: No token provided');
    }

    const idToken = authHeader.split(' ')[1];
    try {
        if (idToken) {
            const decodedToken = await admin.auth().verifyIdToken(idToken);

            const user = await UserModel.findOne({ firebaseAuthId: decodedToken.user_id });

            if (!user) {
                req.userToken = decodedToken;
                req.user = user;
                return next();
            }

            if (user.block === true) {
                return sendResponse(403, false, "User has been block", { block: true }, res);
            }

            req.userToken = decodedToken;
            req.user = user;
            next();
        }
    }
    catch (error) {
        console.error('test Error verifying ID token:', error);
        return sendResponse(401, false, "Unauthorized: Invalid token", null, res);
    }
}

module.exports = decryptFirebaseToken;