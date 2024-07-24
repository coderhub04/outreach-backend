const mongoose = require('mongoose');

const databaseConnection = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Database Connected");
    }
    catch(error) {
        console.error("Database Connection Error: ", error);
    }
};

mongoose.connection.on('error', (error) => {
    console.error('Mongoose Connection Error: ', error);
});

module.exports = {
    databaseConnection,
};