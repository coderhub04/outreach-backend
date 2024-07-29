const sendResponse = (status, success, message, response, res) => {
    console.log(response);
    return res.status(status).json({
        success: success,
        message: message,
        response: response ? response : null,
    });
};

module.exports = sendResponse