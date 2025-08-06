const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads')); // To serve uploaded files like images

// MongoDB Setup
mongoose.connect('mongodb://localhost/timecapsule', { useNewUrlParser: true, useUnifiedTopology: true });

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
  try {
    const { title, message, unlockDate, privacy, userEmail } = req.body;
    const mediaPath = req.file ? req.file.path : null; // Handle file upload

    const newCapsule = new Capsule({
      title,
      message,
      unlockDate,
      privacy,
      mediaPath,
      userEmail: userEmail || 'guest@example.com' // default to 'guest' if no email
    });

    await newCapsule.save();
    res.json({ message: "Capsule Created Successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating capsule. Please try again." });
  }
});

// Public feed route
app.get('/api/public-feed', async (req, res) => {
  try {
    const capsules = await Capsule.find({
      privacy: 'public',
      unlockDate: { $lte: new Date() }
    });
    res.json(capsules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching public capsules. Please try again." });
  }
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

