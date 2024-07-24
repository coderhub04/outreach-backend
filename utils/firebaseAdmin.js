const admin = require("firebase-admin");

const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.PROJECT_ID,
        clientEmail: process.env.CLIENT_EMAIL,
        privateKey: privateKey
    }),
});

module.exports = admin;