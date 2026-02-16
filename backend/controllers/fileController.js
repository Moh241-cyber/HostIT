const { Storage } = require('@google-cloud/storage');
const path = require('path');
const File = require('../models/file');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../aaronbdata-c4d9dd4860ef.json'),
  projectId: 'aaronbdata',
});

const bucketName = 'host_it_bucket';
const bucket = storage.bucket(bucketName);

exports.uploadFile = async (req, res) => {
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

      res.status(200).send({ fileUrl: publicUrl });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });

  blobStream.end(req.file.buffer);
};

exports.deleteFile = async (req, res) => {
  try {
    const fileName = req.params.name;
    const file = bucket.file(fileName);

    await file.delete();
    await File.findOneAndDelete({ name: fileName });

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
