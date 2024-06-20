const s3 = require('../config/s3'); // 
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User'); // 
 
const storage = multer.memoryStorage();
const upload = multer({ storage });
 
// Fonction pour uploader un fichier
exports.uploadFile = async (req, res) => {
    const userId = req.user.id;
    const file = req.file;
 
    try {
        const user = await User.findById(userId);
 
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
 
        if (user.usedSpace + file.size > user.quota) {
            return res.status(400).json({ msg: 'Quota exceeded' });
        }
 
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${userId}/${uuidv4()}_${file.originalname}`,
            Body: file.buffer,
        };
 
        const data = await s3.upload(params).promise();
 
        user.usedSpace += file.size;
        await user.save();
 
        res.json({ fileUrl: data.Location });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
 
// Fonction pour supprimer un fichier
exports.deleteFile = async (req, res) => {
    const { key } = req.body;
 
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    };
 
    try {
        const data = await s3.headObject(params).promise();
        const fileSize = data.ContentLength;
 
        await s3.deleteObject(params).promise();
 
        const user = await User.findById(req.user.id);
 
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
 
        user.usedSpace -= fileSize;
        await user.save();
 
        res.json({ msg: 'File deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};