const express = require('express');
const router = express.Router();
const { uploadFile, deleteFile } = require('../controllers/fileController');
const multer = require('multer');
const auth = require('../middleware/auth'); 

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', auth, upload.single('file'), uploadFile);
router.delete('/:name', auth, deleteFile);

module.exports = router;
