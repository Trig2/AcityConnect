import pool from './connection.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        admin BOOLEAN DEFAULT FALSE,
        phone VARCHAR(20),
        bio TEXT,
        avatar_url VARCHAR(255),
        academic_email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure admin column exists for older schemas
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS admin BOOLEAN DEFAULT FALSE`);

    // Skills table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        skill_name VARCHAR(100) NOT NULL,
        proficiency_level VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'available',
        price DECIMAL(10, 2),
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Skill requests/offers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS skill_exchanges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        skill_offered VARCHAR(100),
        skill_needed VARCHAR(100),
        description TEXT,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Interactions table (interest in items)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS interactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        interaction_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        message_text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notification_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        related_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admin flags/reports table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        reported_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reported_item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
        reported_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        reason TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database initialized successfully!');

    // Seed an admin user - use env vars or hardcoded defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';

    try {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
      if (existing.rows.length === 0) {
        const password_hash = await bcrypt.hash(adminPassword, 10);
        const first_name = process.env.ADMIN_FIRST_NAME || 'Admin';
        const last_name = process.env.ADMIN_LAST_NAME || 'User';
        const academic_email = process.env.ADMIN_ACADEMIC_EMAIL || adminEmail;

        const inserted = await pool.query(
          `INSERT INTO users (first_name, last_name, email, password_hash, academic_email, admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [first_name, last_name, adminEmail, password_hash, academic_email, true]
        );

        console.log(`🔐 Admin user created (id=${inserted.rows[0].id}, email=${adminEmail})`);
        console.log(`   Password: ${adminPassword}`);
      } else {
        // Ensure existing user has admin flag set
        await pool.query('UPDATE users SET admin = TRUE WHERE email = $1', [adminEmail]);
        console.log(`🔐 Admin user ensured (email=${adminEmail})`);
      }
    } catch (err) {
      console.error('❌ Failed to seed admin user:', err);
    }
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    process.exit(1);
  }
};

initDatabase();
