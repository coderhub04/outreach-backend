const ReportModel = require('../../models/ReportModel');
const ResourceFeedsModel = require('../../models/ResourceFeed');
const sendResponse = require('../../utils/response');

const listResources = async (req, res) => {
	try {
		const resources = await ResourceFeedsModel.find().populate({
			path: "userId",
			select: "name username imageUrl _id email",
			model: "users",
			options: {
				virtuals: true,
				justOne: true,
				virtualName: 'user'
			}
		}).populate("category")
		return sendResponse(200, true, 'Resources fetched', resources, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const getResourceById = async (req, res) => {
	try {
		const resource = await ResourceFeedsModel.findOne({ _id: req.params._id }).populate({
			path: "userId",
			select: "name username imageUrl _id email",
			model: "users",
			options: {
				virtuals: true,
				justOne: true,
				virtualName: 'user'
			}
		}).populate("category")
		const reports = await ReportModel.find({ type: "resource", post: resource._id }).populate({
			path: "user",
			select: "name username imageUrl _id email",
			model: "users",
			options: {
				virtuals: true,
				justOne: true,
				virtualName: 'user'
			}
		})
		return sendResponse(200, true, 'Resource fetched', { ...resource.toObject(), reports }, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const disableResources = async (req, res) => {
	try {
		const resource = await ResourceFeedsModel.findByIdAndUpdate(req.params._id);
		const updateResource = await ResourceFeedsModel.findByIdAndUpdate(req.params._id, {
			block: !resource.block
		}, {
			returnOriginal: false
		}).populate({
			path: "userId",
			select: "name username imageUrl _id email",
			model: "users",
			options: {
				virtuals: true,
				justOne: true,
				virtualName: 'user'
			}
		}).populate("category");
		return sendResponse(200, true, 'Success', updateResource, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const approveResources = async (req, res) => {
	try {
		const resource = await ResourceFeedsModel.findByIdAndUpdate(req.params._id);
		const updateResource = await ResourceFeedsModel.findByIdAndUpdate(req.params._id, {
			approved: !resource.approved
		}, {
			returnOriginal: false
		}).populate({
			path: "userId",
			select: "name username imageUrl _id email",
			model: "users",
			options: {
				virtuals: true,
				justOne: true,
				virtualName: 'user'
			}
		}).populate("category");
		return sendResponse(200, true, 'Success', updateResource, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

module.exports = {
	listResources,
	disableResources,
	approveResources,
	getResourceById
}
