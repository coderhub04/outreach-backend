const sendResponse = require('../../utils/response');
const ResourceCategoryModel = require('../../models/ResourceCategoryModel');


const createResourceCategory = async (req, res) => {
    try {
        const newCategory = new ResourceCategoryModel({ ...req.body, createdAt: Date.now() });
        const savedCategory = await newCategory.save();
        return sendResponse(200, true, "Category created successfully", savedCategory, res);
    }
    catch (error) {
        console.error("Error while blocking user:", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

const getAllEnabledResourceCategory = async (req, res) => {
    try {
        const categories = await ResourceCategoryModel.find({ enabled: true }).sort({createdAt: -1});
        return sendResponse(200, true, "Category fetched successfully", categories, res);
    }
    catch (error) {
        console.error("Error while blocking user:", error.message);
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
};

module.exports = { createResourceCategory, getAllEnabledResourceCategory };