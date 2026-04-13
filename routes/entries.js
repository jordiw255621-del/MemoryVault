const express = require('express');
const { prepare, save } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const { search, has_photos, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.*, 
             (SELECT COUNT(*) FROM photos p WHERE p.entry_id = e.id) as photo_count 
      FROM entries e 
      WHERE e.user_id = ? AND e.is_deleted = 0
    `;
    const params = [req.user.id];

    if (search) {
      query += ' AND (e.title LIKE ? OR e.content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const entries = prepare(query).all(...params);

    const countResult = prepare('SELECT COUNT(*) as total FROM entries WHERE user_id = ? AND is_deleted = 0').get(req.user.id);
    const total = countResult?.total || 0;

    res.json({ entries, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

router.get('/:id', authenticateToken, (req, res) => {
  try {
    const entry = prepare('SELECT * FROM entries WHERE id = ? AND user_id = ? AND is_deleted = 0').get(req.params.id, req.user.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const photos = prepare('SELECT * FROM photos WHERE entry_id = ?').all(entry.id);
    entry.photos = photos;

    res.json(entry);
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be less than 200 characters' });
    }

    const result = prepare('INSERT INTO entries (user_id, title, content) VALUES (?, ?, ?)').run(req.user.id, title, content);

    const entry = prepare('SELECT * FROM entries WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(entry);
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { title, content } = req.body;

    const existing = prepare('SELECT * FROM entries WHERE id = ? AND user_id = ? AND is_deleted = 0').get(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be less than 200 characters' });
    }

    prepare('UPDATE entries SET title = ?, content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(title, content, req.params.id);

    const entry = prepare('SELECT * FROM entries WHERE id = ?').get(req.params.id);

    res.json(entry);
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const existing = prepare('SELECT * FROM entries WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    if (existing.is_deleted) {
      return res.status(400).json({ error: 'Entry already in trash' });
    }

    prepare('UPDATE entries SET is_deleted = 1, deleted_at = datetime(\'now\') WHERE id = ?').run(req.params.id);

    res.json({ message: 'Entry moved to trash' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;