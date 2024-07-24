const AdminModel = require("../models/AdminModel");
const sendResponse = require("../utils/response");
const sanitizeData = require("../utils/sanitizeData");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminSignUpController = async (req, res) => {
    try {
        const { username, password } = sanitizeData(req.body);
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new AdminModel({ username: username, password: hashedPassword });
        await admin.save();

        return sendResponse(200, true, "Admin Login Created Successfully", null, res);
    }
    catch (error) {
        console.error("Error while creating admin login: ", error.message);
        return sendResponse(500, false, "Internal Server Error", error.message, res);
    }
};

const adminLoginController = async (req, res) => {
    try {
        const { username, password } = sanitizeData(req.body);

        const admin = await AdminModel.findOne({ username: username });
        if (!admin) {
            return sendResponse(404, false, "Invalid Username/Password", null, res);
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return sendResponse(404, false, "Invalid Username/Password", null, res);
        }

        const token = jwt.sign({
            userId: admin._id,
            username: username,
        }, process.env.JWT_SECRET_TOKEN);

        return sendResponse(200, true, "Admin Login Successful", token, res);
    }
    catch (error) {
        console.error("Error while admin Login: ", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

const updateAdminPasswordController = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const { userId } = req.tokenData;

        if (!oldPassword || !newPassword) {
            return sendResponse(400, false, "Old password and new password are required", null, res);
        }

        const user = await AdminModel.findById(userId);

        if (!user) {
            return sendResponse(404, false, "admin not found", null, res);
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return sendResponse(400, false, "Old password is incorrect", null, res);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        const token = jwt.sign({
            userId: user._id,
            username: user.username,
        }, process.env.JWT_SECRET_TOKEN);

        return sendResponse(200, true, "Password updated successfully", token, res);
    }
    catch (error) {
        console.error("Error while updating password: ", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

module.exports = {
    adminLoginController,
    updateAdminPasswordController,
    adminSignUpController,
};