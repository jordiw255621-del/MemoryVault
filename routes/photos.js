const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { prepare, save } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', String(req.user.id));
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.'));
    }
  }
});

router.post('/entry/:entryId', authenticateToken, upload.array('photos', 10), (req, res) => {
  try {
    const entry = prepare('SELECT * FROM entries WHERE id = ? AND user_id = ?').get(req.params.entryId, req.user.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const existingPhotos = prepare('SELECT COUNT(*) as count FROM photos WHERE entry_id = ?').get(entry.id)?.count || 0;
    if (existingPhotos + req.files.length > 10) {
      for (const file of req.files) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ error: 'Maximum 10 photos per entry' });
    }

    const insertedPhotos = [];
    for (const file of req.files) {
      const result = prepare('INSERT INTO photos (entry_id, user_id, filename, original_name) VALUES (?, ?, ?, ?)').run(entry.id, req.user.id, file.filename, file.originalname);
      insertedPhotos.push({
        id: result.lastInsertRowid,
        filename: file.filename,
        original_name: file.originalname
      });
    }

    res.status(201).json({ message: 'Photos uploaded successfully', photos: insertedPhotos });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

router.get('/:id', authenticateToken, (req, res) => {
  try {
    const photo = prepare('SELECT * FROM photos WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json(photo);
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ error: 'Failed to get photo' });
  }
});

router.get('/:id/download', authenticateToken, (req, res) => {
  try {
    const photo = prepare('SELECT * FROM photos WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', String(req.user.id), photo.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Photo file not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename=${photo.original_name}`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Download photo error:', error);
    res.status(500).json({ error: 'Failed to download photo' });
  }
});

router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const photo = prepare('SELECT * FROM photos WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', String(req.user.id), photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

router.get('/entry/:entryId', authenticateToken, (req, res) => {
  try {
    const entry = prepare('SELECT * FROM entries WHERE id = ? AND user_id = ?').get(req.params.entryId, req.user.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const photos = prepare('SELECT * FROM photos WHERE entry_id = ?').all(entry.id);

    res.json(photos);
  } catch (error) {
    console.error('Get entry photos error:', error);
    res.status(500).json({ error: 'Failed to get photos' });
  }
});

module.exports = router;