import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './db/init.js';
import userRoutes from './routes/userRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import interactionRoutes from './routes/interactionRoutes.js';

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
