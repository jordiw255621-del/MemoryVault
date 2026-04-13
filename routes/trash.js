const express = require('express');
const { prepare, save } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const TRASH_DURATION_DAYS = 30;

router.get('/', authenticateToken, (req, res) => {
  try {
    const entries = prepare(`
      SELECT e.*, 
             (SELECT COUNT(*) FROM photos p WHERE p.entry_id = e.id) as photo_count,
             julianday('now') - julianday(e.deleted_at) as days_in_trash
      FROM entries e 
      WHERE e.user_id = ? AND e.is_deleted = 1
      ORDER BY e.deleted_at DESC
    `).all(req.user.id);

    res.json(entries.map(entry => ({
      ...entry,
      days_remaining: Math.max(0, TRASH_DURATION_DAYS - Math.floor(entry.days_in_trash))
    })));
  } catch (error) {
    console.error('Get trash error:', error);
    res.status(500).json({ error: 'Failed to fetch trash' });
  }
});

router.post('/:id/restore', authenticateToken, (req, res) => {
  try {
    const existing = prepare('SELECT * FROM entries WHERE id = ? AND user_id = ? AND is_deleted = 1').get(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Entry not found in trash' });
    }

    prepare('UPDATE entries SET is_deleted = 0, deleted_at = NULL WHERE id = ?').run(req.params.id);

    res.json({ message: 'Entry restored successfully' });
  } catch (error) {
    console.error('Restore entry error:', error);
    res.status(500).json({ error: 'Failed to restore entry' });
  }
});

router.delete('/:id/permanent', authenticateToken, (req, res) => {
  try {
    const existing = prepare('SELECT * FROM entries WHERE id = ? AND user_id = ? AND is_deleted = 1').get(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Entry not found in trash' });
    }

    const photos = prepare('SELECT * FROM photos WHERE entry_id = ?').all(req.params.id);
    for (const photo of photos) {
      const filePath = path.join(__dirname, '..', 'uploads', String(req.user.id), photo.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    prepare('DELETE FROM photos WHERE entry_id = ?').run(req.params.id);
    prepare('DELETE FROM entries WHERE id = ?').run(req.params.id);

    res.json({ message: 'Entry permanently deleted' });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ error: 'Failed to permanently delete entry' });
  }
});

router.delete('/empty', authenticateToken, (req, res) => {
  try {
    const entries = prepare('SELECT id FROM entries WHERE user_id = ? AND is_deleted = 1').all(req.user.id);

    for (const entry of entries) {
      const photos = prepare('SELECT * FROM photos WHERE entry_id = ?').all(entry.id);
      for (const photo of photos) {
        const filePath = path.join(__dirname, '..', 'uploads', String(req.user.id), photo.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      prepare('DELETE FROM photos WHERE entry_id = ?').run(entry.id);
      prepare('DELETE FROM entries WHERE id = ?').run(entry.id);
    }

    res.json({ message: 'Trash emptied successfully' });
  } catch (error) {
    console.error('Empty trash error:', error);
    res.status(500).json({ error: 'Failed to empty trash' });
  }
});

router.post('/cleanup', authenticateToken, (req, res) => {
  try {
    const expiredEntries = prepare(`
      SELECT e.id FROM entries e 
      WHERE e.user_id = ? AND e.is_deleted = 1 
      AND julianday('now') - julianday(e.deleted_at) >= ?
    `).all(req.user.id, TRASH_DURATION_DAYS);

    for (const entry of expiredEntries) {
      const photos = prepare('SELECT * FROM photos WHERE entry_id = ?').all(entry.id);
      for (const photo of photos) {
        const filePath = path.join(__dirname, '..', 'uploads', String(req.user.id), photo.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      prepare('DELETE FROM photos WHERE entry_id = ?').run(entry.id);
      prepare('DELETE FROM entries WHERE id = ?').run(entry.id);
    }

    res.json({ message: `Cleaned up ${expiredEntries.length} expired entries` });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup expired entries' });
  }
});

module.exports = router;