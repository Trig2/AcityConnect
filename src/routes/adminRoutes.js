import express from 'express';
import pool from '../db/connection.js';
import { authMiddleware, isAdminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware, isAdminMiddleware);

router.get('/summary', async (req, res) => {
  try {
    const [users, items, skills, skillExchanges, interactions, messages] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM items'),
      pool.query('SELECT COUNT(*)::int AS count FROM skills'),
      pool.query('SELECT COUNT(*)::int AS count FROM skill_exchanges'),
      pool.query('SELECT COUNT(*)::int AS count FROM interactions'),
      pool.query('SELECT COUNT(*)::int AS count FROM messages')
    ]);

    res.json({
      users: users.rows[0].count,
      items: items.rows[0].count,
      skills: skills.rows[0].count,
      skillExchanges: skillExchanges.rows[0].count,
      interactions: interactions.rows[0].count,
      messages: messages.rows[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/items', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT items.*, users.first_name, users.last_name, users.email
       FROM items
       JOIN users ON items.user_id = users.id
       ORDER BY items.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, status, price, image_url } = req.body;

    const result = await pool.query(
      `UPDATE items
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           status = COALESCE($4, status),
           price = COALESCE($5, price),
           image_url = COALESCE($6, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [title, description, category, status, price, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item updated', item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT reports.*, 
              reporter.first_name AS reporter_first_name,
              reporter.last_name AS reporter_last_name,
              item.title AS item_title,
              reported_user.first_name AS reported_user_first_name,
              reported_user.last_name AS reported_user_last_name,
              reported_user.email AS reported_user_email
       FROM reports
       LEFT JOIN users reporter ON reports.reported_by = reporter.id
       LEFT JOIN items item ON reports.reported_item_id = item.id
       LEFT JOIN users reported_user ON reports.reported_user_id = reported_user.id
       ORDER BY reports.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'resolved' } = req.body;

    const result = await pool.query(
      'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report updated', report: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM reports WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;