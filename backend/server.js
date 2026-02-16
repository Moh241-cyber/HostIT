const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');
const File = require('./models/file');
const ActivityLog = require('./models/ActivityLog');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());

// Enable CORS
app.use(cors());

// Google Cloud Storage configuration
const storage = new Storage({
  keyFilename: path.join(__dirname, 'aaronbdata-c4d9dd4860ef.json'),
  projectId: 'aaronbdata',
});

const bucketName = 'host_it_bucket';
const bucket = storage.bucket(bucketName);

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint to get quota
app.get('/api/quota', async (req, res) => {
  try {
    const files = await File.find();
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    res.json({ totalSize });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to upload files
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  blobStream.on('error', (err) => {
    res.status(500).send({ message: err.message });
  });

  blobStream.on('finish', async () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    try {
      const newFile = new File({
        name: req.file.originalname,
        size: req.file.size,
        url: publicUrl,
      });
      await newFile.save();

      // Enregistrer l'activité de téléchargement
      const newActivity = new ActivityLog({
        activity: `File ${req.file.originalname} uploaded.`,
      });
      await newActivity.save();

      const files = await File.find();
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);

      res.status(200).send({ fileUrl: publicUrl, totalSize });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  blobStream.end(req.file.buffer);
});

// Endpoint to delete files
app.delete('/api/files/:name', async (req, res) => {
  try {
    const fileName = req.params.name;
    const file = bucket.file(fileName);

    await file.delete();
    await File.findOneAndDelete({ name: fileName });

    // Enregistrer l'activité de suppression
    const newActivity = new ActivityLog({
      activity: `File ${fileName} deleted.`,
    });
    await newActivity.save();

    const files = await File.find();
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    res.status(200).json({ message: 'File deleted successfully', totalSize });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to get activity log
app.get('/api/activity-log', async (req, res) => {
  try {
    const activityLogs = await ActivityLog.find().sort({ createdAt: -1 });
    res.json(activityLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/file'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
