const sendResponse = require("../utils/response");
const ReportModel = require("../models/ReportModel");


const createReport = async (req, res) => {
	try {
		const newReport = new ReportModel(req.body);
		const savedReport = await newReport.save();
		return sendResponse(201, true, "Report Registered Successfully", savedReport, res);
	} catch (error) {
		return sendResponse(500, false, "Internal Server Error", null, res);
	}
}


module.exports = {
	createReport
}