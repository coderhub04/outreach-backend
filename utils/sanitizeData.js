const validator = require('validator');

const sanitizeData = (data) => {
    const sanitizedData = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (typeof data[key] === 'string') {
                if (key === 'imageUrl') {
                    if (validator.isURL(data[key].trim())) {
                        sanitizedData[key] = data[key].trim();
                    } else {
                        throw new Error('Invalid URL');
                    }
                } else {
                    sanitizedData[key] = validator.escape(data[key].trim());
                }
            } else {
                sanitizedData[key] = data[key];
            }
        }
    }
    return sanitizedData;
};

module.exports = sanitizeData
