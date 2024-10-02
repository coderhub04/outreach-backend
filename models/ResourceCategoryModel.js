const mongoose = require("mongoose");

const ResourceCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    createdAt: {
		type: Number,
		default: Date.now(),
	},
	enabled: {
		type: Boolean,
		default: true
	},
});

const ResourceCategoryModel = mongoose.model("resource_category", ResourceCategorySchema);

module.exports = ResourceCategoryModel