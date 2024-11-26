const express = require('express');
const router = express.Router();
const { ChatTokenBuilder, RtcRole, RtcTokenBuilder } = require("agora-token");

const appId = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;
const orgName = process.env.AGORA_ORG_NAME;

if (!appId || !appCertificate) {
	console.error("App ID or App Certificate is missing. Check your .env file.");
	process.exit(1);
}


router.post("/chat/token", async (req, res) => {
	try {
		// Token expiration time (24 hours from now)
		const expirationInSeconds = 24 * 3600; // 24 hours
		const currentTimestamp = Math.floor(Date.now() / 1000);
		const privilegeExpiredTs = currentTimestamp + expirationInSeconds;

		// Build the token
		const token = ChatTokenBuilder.buildAppToken(
			appId,
			appCertificate,
			privilegeExpiredTs // Correct parameter is privilegeExpiredTs
		);

		res.json({
			chatToken: token,
			appId: appId,
			orgName: orgName,
			expireTimestamp: privilegeExpiredTs,
		});
	} catch (error) {
		console.error("Error generating token:", error);
		res.status(500).json({
			error: error.message,
			timestamp: Date.now(),
			duration: 0,
			error_description: "Failed to generate chat token",
		});
	}
});
router.post("/call/token", async (req, res) => {
	const { channelName, uid, role, expirationTimeInSeconds } = req.body;

	if (!channelName || uid === undefined || !role) {
		return res.status(400).json({ error: 'channelName, uid, and role are required' });
	}

	const rtcRole =
		role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;


	const expirationTime = Math.floor(Date.now() / 1000) + (expirationTimeInSeconds || 3600);

	const token = RtcTokenBuilder.buildTokenWithUid(
		appId,
		appCertificate,
		channelName,
		uid,
		rtcRole,
		expirationTime
	);
	res.json({ token });

});


module.exports = router;