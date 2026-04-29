import pool from '../db/connection.js';

export const getAllSkillExchanges = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM skill_exchanges WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (skill_offered ILIKE $' + (params.length + 1) + ' OR skill_needed ILIKE $' + (params.length + 1) + ')';
      params.push('%' + search + '%');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createSkillExchange = async (req, res) => {
  try {
    const { skill_offered, skill_needed, description } = req.body;
    const user_id = req.user.id;

    if (!skill_offered && !skill_needed) {
      return res.status(400).json({ error: 'Must specify either skill_offered or skill_needed' });
    }

    const result = await pool.query(
      'INSERT INTO skill_exchanges (user_id, skill_offered, skill_needed, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, skill_offered, skill_needed, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSkillExchangeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM skill_exchanges WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Skill exchange not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateSkillExchange = async (req, res) => {
  try {
    const { id } = req.params;
    const { skill_offered, skill_needed, description, status } = req.body;

    const result = await pool.query(
      'UPDATE skill_exchanges SET skill_offered = COALESCE($1, skill_offered), skill_needed = COALESCE($2, skill_needed), description = COALESCE($3, description), status = COALESCE($4, status) WHERE id = $5 RETURNING *',
      [skill_offered, skill_needed, description, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Skill exchange not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteSkillExchange = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM skill_exchanges WHERE id = $1', [id]);
    res.json({ message: 'Skill exchange deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
