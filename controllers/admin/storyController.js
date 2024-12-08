const StoryModel = require('../../models/StoryModel');
const UserModel = require('../../models/UserModel');
const sendResponse = require('../../utils/response');

const listStory = async (req, res) => {
	try {
		const stories = await StoryModel.find();
		return sendResponse(200, true, 'Stories fetched', stories, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

const disableStory = async (req, res) => {
	try {
		const story = await StoryModel.findByIdAndUpdate(req.params._id);
		const updatedStory = await StoryModel.findByIdAndUpdate(req.params._id, {
			deleted: !story.deleted
		}, {
			returnOriginal: false
		});
		return sendResponse(200, true, 'Success', updatedStory, res);
	} catch (error) {
		return sendResponse(500, false, error.message, null, res);
	}
}

module.exports = {
	listStory,
	disableStory
}