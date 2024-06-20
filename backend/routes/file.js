const express = require('express');
const router = express.Router();
const { uploadFile, deleteFile } = require('../controllers/fileController');
const multer = require('multer');
const auth = require('../middleware/auth'); // Assurez-vous que vous avez un middleware d'authentification
 
const storage = multer.memoryStorage();
const upload = multer({ storage });
 
// Route pour uploader un fichier
router.post('/upload', auth, upload.single('file'), uploadFile);
 
// Route pour supprimer un fichier
router.delete('/delete', auth, deleteFile);
 
module.exports = router;