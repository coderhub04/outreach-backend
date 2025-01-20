const express = require('express');
const { generateToken04 } = require('../../utils/zego'); 
const router = express.Router();


// Route
router.post('/generate-token', (req, res) => {
    const token = generateToken04(req.body.appId, req.body.userId, req.body.secret)
    return res.json({token, success: true})
});



module.exports = router