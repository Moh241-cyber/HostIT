const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
 
router.get('/quota', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('quota usedSpace');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
 
module.exports = router;