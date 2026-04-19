import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import jwt from 'jsonwebtoken';

// Models
import Paper from './models/Paper.js';
import Annotation from './models/Annotation.js';
import Collection from './models/Collection.js';
import User from './models/User.js';

// Routes
import authRoutes from './routes/auth.js';

dotenv.config();

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      next();
    } catch (error) {
      console.error('JWT Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/academic-annotator';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// API Routes
app.use('/api/auth', authRoutes);

// Paper Routes
app.get('/api/papers', protect, async (req, res) => {
  const papers = await Paper.find().populate('uploader').populate('collections');
  res.json(papers);
});

// Collection Routes
app.get('/api/collections', protect, async (req, res) => {
  const collections = await Collection.find({ $or: [{ owner: req.user._id }, { collaborators: req.user._id }] }).populate('papers');
  res.json(collections);
});

app.post('/api/papers/upload', protect, upload.single('paper'), async (req, res) => {
  try {
    const paper = new Paper({
      title: req.body.title || req.file.originalname,
      author: req.body.author,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      uploader: req.user._id
    });
    await paper.save();
    res.status(201).json(paper);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collections', protect, async (req, res) => {
  try {
    const collection = new Collection({
      name: req.body.name,
      description: req.body.description,
      owner: req.user._id,
    });
    await collection.save();
    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collections/:id/papers', protect, async (req, res) => {
  try {
    const { paperId } = req.body;
    const collection = await Collection.findById(req.params.id);
    if (!collection.papers.includes(paperId)) {
      collection.papers.push(paperId);
      await collection.save();
      
      // Also update paper side
      const paper = await Paper.findById(paperId);
      if (!paper.collections.includes(collection._id)) {
        paper.collections.push(collection._id);
        await paper.save();
      }
    }
    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/papers/:id/annotations', async (req, res) => {
  const annotations = await Annotation.find({ paperId: req.params.id });
  res.json(annotations);
});

app.post('/api/annotations', async (req, res) => {
  try {
    const annotation = new Annotation(req.body);
    await annotation.save();
    // Broadcast via socket
    io.to(req.body.paperId).emit('annotation_added', annotation);
    res.status(201).json(annotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  const results = await Annotation.find({ $text: { $search: q } }).populate('paperId');
  res.json(results);
});

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_paper', (paperId) => {
    socket.join(paperId);
    console.log(`User ${socket.id} joined paper ${paperId}`);
  });

  socket.on('leave_paper', (paperId) => {
    socket.leave(paperId);
    console.log(`User ${socket.id} left paper ${paperId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
import fs from 'fs';

// Delete Paper
app.delete('/api/papers/:id', protect, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: 'Paper not found' });

    // Check ownership
    if (paper.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this paper' });
    }

    // Delete file
    const filePath = path.join(__dirname, paper.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete related annotations
    await Annotation.deleteMany({ paperId: paper._id });

    // Remove from collections
    await Collection.updateMany(
      { papers: paper._id },
      { $pull: { papers: paper._id } }
    );

    await Paper.findByIdAndDelete(paper._id);
    res.json({ message: 'Paper deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
