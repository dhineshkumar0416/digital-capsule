const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Setup
mongoose.connect('mongodb://localhost/timecapsule');

// Multer for media upload
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Capsule Schema
const Capsule = mongoose.model('Capsule', new mongoose.Schema({
  title: String,
  message: String,
  mediaPath: String,
  unlockDate: Date,
  privacy: String,
  userEmail: String,
  isUnlocked: { type: Boolean, default: false }
}));

// Create capsule route
app.post('/api/capsules', upload.single('media'), async (req, res) => {
  const { title, message, unlockDate, privacy } = req.body;
  const mediaPath = req.file ? req.file.path : null;
  const capsule = new Capsule({ title, message, unlockDate, privacy, mediaPath, userEmail: "example@gmail.com" });
  await capsule.save();
  res.json({ message: "Capsule Created Successfully!" });
});

// Public feed route
app.get('/api/public-feed', async (req, res) => {
  const capsules = await Capsule.find({ privacy: 'public', unlockDate: { $lte: new Date() } });
  res.json(capsules);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
