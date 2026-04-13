const express = require('express');
const { prepare } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const JSZip = require('jszip');

const router = express.Router();

router.get('/text', authenticateToken, (req, res) => {
  try {
    const entries = prepare(`
      SELECT * FROM entries 
      WHERE user_id = ? AND is_deleted = 0 
      ORDER BY created_at DESC
    `).all(req.user.id);

    let textContent = '# My Journal Entries\n\n';
    textContent += `Exported on: ${new Date().toLocaleDateString()}\n`;
    textContent += `Total entries: ${entries.length}\n\n`;
    textContent += '---\n\n';

    for (const entry of entries) {
      const date = new Date(entry.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      textContent += `## ${date} - ${entry.title}\n\n`;
      textContent += entry.content + '\n\n';
      textContent += '---\n\n';
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=my-journal-entries.txt');
    res.send(textContent);
  } catch (error) {
    console.error('Export text error:', error);
    res.status(500).json({ error: 'Failed to export text' });
  }
});

router.get('/images', authenticateToken, (req, res) => {
  try {
    const photos = prepare(`
      SELECT p.*, e.title, e.created_at as entry_date
      FROM photos p
      JOIN entries e ON p.entry_id = e.id
      WHERE e.user_id = ? AND e.is_deleted = 0
      ORDER BY e.created_at DESC
    `).all(req.user.id);

    if (photos.length === 0) {
      return res.status(404).json({ error: 'No photos to export' });
    }

    const zip = new JSZip();

    for (const photo of photos) {
      const filePath = path.join(__dirname, '..', 'uploads', String(req.user.id), photo.filename);
      if (fs.existsSync(filePath)) {
        const date = new Date(photo.entry_date).toISOString().split('T')[0];
        const folderName = `${date}-${photo.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}`;
        let folder = zip.folder(folderName);
        const fileContent = fs.readFileSync(filePath);
        folder.file(photo.original_name, fileContent);
      }
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=MemoryVault-Images.zip');

    zip.generateAsync({ type: 'nodebuffer' }).then(buffer => {
      res.send(buffer);
    });
  } catch (error) {
    console.error('Export images error:', error);
    res.status(500).json({ error: 'Failed to export images' });
  }
});

router.get('/stats', authenticateToken, (req, res) => {
  try {
    const totalEntries = prepare('SELECT COUNT(*) as count FROM entries WHERE user_id = ? AND is_deleted = 0').get(req.user.id)?.count || 0;
    const totalPhotos = prepare('SELECT COUNT(*) as count FROM photos p JOIN entries e ON p.entry_id = e.id WHERE e.user_id = ? AND e.is_deleted = 0').get(req.user.id)?.count || 0;
    const trashCount = prepare('SELECT COUNT(*) as count FROM entries WHERE user_id = ? AND is_deleted = 1').get(req.user.id)?.count || 0;

    const user = prepare('SELECT created_at FROM users WHERE id = ?').get(req.user.id);
    const daysActive = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));

    res.json({
      totalEntries,
      totalPhotos,
      trashCount,
      daysActive
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;