import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

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

export default router;