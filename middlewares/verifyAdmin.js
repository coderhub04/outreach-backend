const jwt = require('jsonwebtoken');
const AdminModel = require("../models/AdminModel");
const sendResponse= require("../utils/response");

const verifyAdmin = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return sendResponse(401, false, "Authorization token not found", null, null, res);
        }

        const token = authorizationHeader.split(" ")[1];
        let tokenData;

        try {
            tokenData = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        } catch (error) {
            return sendResponse(401, false, "Invalid token", null, error.message, res);
        }

        const admin = await AdminModel.findOne({ username: tokenData.username });

        if (!admin) {
            return sendResponse(401, false, "Unauthorized", null, null, res);
        }

        req.tokenData = tokenData;
        next();
    } catch (error) {
        console.error("Error in Verify Admin Middleware: ", error.message);
        return sendResponse(500, false, "Internal Server Error", null, error.message, res);
    }
};

module.exports = verifyAdmin