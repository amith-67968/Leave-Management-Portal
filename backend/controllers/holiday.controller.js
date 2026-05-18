const pool = require('../config/db');

// GET /api/holidays?year=YYYY
const getHolidays = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const result = await pool.query(
      `SELECT * FROM holidays WHERE EXTRACT(YEAR FROM date) = $1 ORDER BY date`, [year]
    );
    res.json({ holidays: result.rows, year: parseInt(year) });
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /api/admin/holidays
const addHoliday = async (req, res) => {
  try {
    const { date, name, is_optional } = req.body;
    if (!date || !name) return res.status(400).json({ error: 'date and name required.' });
    const exists = await pool.query('SELECT id FROM holidays WHERE date = $1', [date]);
    if (exists.rows.length > 0) return res.status(409).json({ error: 'Holiday exists on this date.' });
    const result = await pool.query(
      `INSERT INTO holidays (date, name, is_optional) VALUES ($1, $2, $3) RETURNING *`,
      [date, name, is_optional || false]
    );
    res.status(201).json({ message: 'Holiday added.', holiday: result.rows[0] });
  } catch (error) {
    console.error('Add holiday error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// DELETE /api/admin/holidays/:id
const deleteHoliday = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM holidays WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Holiday not found.' });
    res.json({ message: 'Holiday deleted.' });
  } catch (error) {
    console.error('Delete holiday error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getHolidays, addHoliday, deleteHoliday };
