import pool from '../db/connection.js';

export const expressInterest = async (req, res) => {
  try {
    const { item_id, interaction_type } = req.body;
    const user_id = req.user.id;

    if (!item_id || !interaction_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO interactions (user_id, item_id, interaction_type) VALUES ($1, $2, $3) RETURNING *',
      [user_id, item_id, interaction_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getItemInterests = async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await pool.query(
      'SELECT i.*, u.first_name, u.last_name, u.email FROM interactions i JOIN users u ON i.user_id = u.id WHERE i.item_id = $1',
      [itemId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserInteractions = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT i.*, it.title, it.description FROM interactions i JOIN items it ON i.item_id = it.id WHERE i.user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { recipient_id, item_id, message_text } = req.body;
    const sender_id = req.user.id;

    if (!recipient_id || !message_text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO messages (sender_id, recipient_id, item_id, message_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [sender_id, recipient_id, item_id, message_text]
    );

    // Create notification for recipient
    await pool.query(
      'INSERT INTO notifications (user_id, notification_type, message, related_id) VALUES ($1, $2, $3, $4)',
      [recipient_id, 'message', `New message from user ${sender_id}`, result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT m.*, u.first_name, u.last_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.recipient_id = $1 ORDER BY m.created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const reportContent = async (req, res) => {
  try {
    const { reported_item_id, reported_user_id, reason } = req.body;
    const reported_by = req.user.id;

    if (!reason || (!reported_item_id && !reported_user_id)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO reports (reported_by, reported_item_id, reported_user_id, reason) VALUES ($1, $2, $3, $4) RETURNING *',
      [reported_by, reported_item_id, reported_user_id, reason]
    );

    res.status(201).json({ message: 'Report submitted', report: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
