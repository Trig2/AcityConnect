import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/connection.js';
import './db/init.js';
import userRoutes from './routes/userRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import interactionRoutes from './routes/interactionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/admin', adminRoutes);

// Public homepage stats
app.get('/api/stats', async (req, res) => {
  try {
    const [users, items, skillExchanges] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM items'),
      pool.query('SELECT COUNT(*)::int AS count FROM skill_exchanges')
    ]);

    res.json({
      activeUsers: users.rows[0].count,
      itemsListed: items.rows[0].count,
      skillsShared: skillExchanges.rows[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// API root
app.get('/api', (req, res) => {
  res.json({
    status: 'ACity Connect API is running',
    endpoints: ['/api/health', '/api/users', '/api/items', '/api/skills', '/api/interactions']
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
