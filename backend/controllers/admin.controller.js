const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function runCarryForward(client, fromYear, toYear) {
  const result = await client.query(
    `INSERT INTO leave_balances (user_id, leave_type_id, year, allocated, used, remaining, carried_forward)
     SELECT lb.user_id,
            lb.leave_type_id,
            $2,
            lt.annual_quota,
            0,
            lt.annual_quota + LEAST(GREATEST(lb.remaining, 0), lt.carry_forward_max),
            LEAST(GREATEST(lb.remaining, 0), lt.carry_forward_max)
     FROM leave_balances lb
     JOIN leave_types lt ON lb.leave_type_id = lt.id
     JOIN users u ON lb.user_id = u.id
     WHERE lb.year = $1
       AND lt.is_active = TRUE
       AND lt.is_paid = TRUE
       AND u.is_active = TRUE
     ON CONFLICT (user_id, leave_type_id, year)
     DO UPDATE SET allocated = EXCLUDED.allocated,
                   carried_forward = EXCLUDED.carried_forward,
                   remaining = EXCLUDED.remaining,
                   updated_at = NOW()
     RETURNING *`,
    [fromYear, toYear]
  );

  return result.rows;
}

// GET /api/admin/leave-types
const getLeaveTypes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leave_types ORDER BY name');
    res.json({ leave_types: result.rows });
  } catch (error) {
    console.error('Get leave types error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /api/admin/leave-types
const createLeaveType = async (req, res) => {
  try {
    const { name, annual_quota, carry_forward_max, is_paid, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required.' });
    const result = await pool.query(
      `INSERT INTO leave_types (name, annual_quota, carry_forward_max, is_paid, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, annual_quota || 0, carry_forward_max || 0, is_paid !== false, description || '']
    );
    res.status(201).json({ message: 'Leave type created.', leave_type: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Leave type name already exists.' });
    console.error('Create leave type error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// PUT /api/admin/leave-types/:id
const updateLeaveType = async (req, res) => {
  try {
    const { name, annual_quota, carry_forward_max, is_paid, description, is_active } = req.body;
    const result = await pool.query(
      `UPDATE leave_types SET name=COALESCE($1,name), annual_quota=COALESCE($2,annual_quota),
       carry_forward_max=COALESCE($3,carry_forward_max), is_paid=COALESCE($4,is_paid),
       description=COALESCE($5,description), is_active=COALESCE($6,is_active)
       WHERE id=$7 RETURNING *`,
      [name, annual_quota, carry_forward_max, is_paid, description, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Leave type not found.' });
    res.json({ message: 'Leave type updated.', leave_type: result.rows[0] });
  } catch (error) {
    console.error('Update leave type error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.joining_date, u.monthly_salary, u.is_active,
              m.name as manager_name FROM users u LEFT JOIN users m ON u.manager_id = m.id ORDER BY u.name`
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /api/admin/users
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, manager_id, joining_date, monthly_salary } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required.' });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, manager_id, joining_date, monthly_salary)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role`,
      [name, email.toLowerCase(), hash, role || 'employee', manager_id || null,
       joining_date || new Date(), monthly_salary || 0]
    );

    // Create leave balances for new user
    const leaveTypes = await pool.query('SELECT id, annual_quota FROM leave_types WHERE is_active = TRUE AND is_paid = TRUE');
    const year = new Date().getFullYear();
    for (const lt of leaveTypes.rows) {
      await pool.query(
        `INSERT INTO leave_balances (user_id, leave_type_id, year, allocated, used, remaining)
         VALUES ($1, $2, $3, $4, 0, $4) ON CONFLICT DO NOTHING`,
        [result.rows[0].id, lt.id, year, lt.annual_quota]
      );
    }

    res.status(201).json({ message: 'User created.', user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Email already exists.' });
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, role, manager_id, monthly_salary, is_active } = req.body;
    const result = await pool.query(
      `UPDATE users SET name=COALESCE($1,name), role=COALESCE($2,role),
       manager_id=COALESCE($3,manager_id), monthly_salary=COALESCE($4,monthly_salary),
       is_active=COALESCE($5,is_active) WHERE id=$6 RETURNING id,name,email,role`,
      [name, role, manager_id, monthly_salary, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User updated.', user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/admin/payroll
const getPayroll = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = `SELECT pl.*, u.name as employee_name, u.email as employee_email, u.monthly_salary FROM payroll_logs pl
                 JOIN users u ON pl.user_id = u.id WHERE 1=1`;
    const params = [];
    if (year) { params.push(year); query += ` AND pl.year = $${params.length}`; }
    if (month) { params.push(month); query += ` AND pl.month = $${params.length}`; }
    query += ' ORDER BY pl.year DESC, pl.month DESC, u.name';
    const result = await pool.query(query, params);
    res.json({ payroll: result.rows });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/admin/leaves — complete leave history
const getAllLeaves = async (req, res) => {
  try {
    const { status, year } = req.query;
    let query = `SELECT l.*, lt.name as leave_type_name, u.name as employee_name,
                 u.email as employee_email, d.name as decided_by_name
                 FROM leaves l JOIN leave_types lt ON l.leave_type_id = lt.id
                 JOIN users u ON l.user_id = u.id LEFT JOIN users d ON l.decided_by = d.id WHERE 1=1`;
    const params = [];
    if (status) { params.push(status); query += ` AND l.status = $${params.length}`; }
    if (year) { params.push(year); query += ` AND EXTRACT(YEAR FROM l.from_date) = $${params.length}`; }
    query += ' ORDER BY l.applied_at DESC';
    const result = await pool.query(query, params);
    res.json({ leaves: result.rows });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [users, pending, approved, totalLop] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE'),
      pool.query("SELECT COUNT(*) as count FROM leaves WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) as count FROM leaves WHERE status = 'approved'"),
      pool.query('SELECT COALESCE(SUM(lop_days),0) as total, COALESCE(SUM(deduction_amount),0) as amount FROM payroll_logs'),
    ]);
    res.json({
      total_users: parseInt(users.rows[0].count),
      pending_leaves: parseInt(pending.rows[0].count),
      approved_leaves: parseInt(approved.rows[0].count),
      total_lop_days: parseFloat(totalLop.rows[0].total),
      total_deductions: parseFloat(totalLop.rows[0].amount),
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /api/admin/holiday-work - mark holiday work and auto-credit compensatory off
const creditHolidayWork = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, work_date, credited_days = 1, notes = '' } = req.body;
    if (!user_id || !work_date) {
      return res.status(400).json({ error: 'user_id and work_date are required.' });
    }

    await client.query('BEGIN');

    const holiday = await client.query('SELECT id, name FROM holidays WHERE date = $1', [work_date]);
    if (holiday.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Selected date is not a company holiday.' });
    }

    const leaveType = await client.query(
      `INSERT INTO leave_types (name, annual_quota, carry_forward_max, is_paid, description)
       VALUES ('Compensatory Off', 0, 5, TRUE, 'Auto-credited when an employee works on a company holiday')
       ON CONFLICT (name) DO UPDATE SET is_active = TRUE
       RETURNING id`,
    );

    const leaveTypeId = leaveType.rows[0].id;
    const year = new Date(work_date).getFullYear();
    const days = Math.max(0.5, Math.min(parseFloat(credited_days) || 1, 1));

    const credit = await client.query(
      `INSERT INTO holiday_work_logs (user_id, holiday_id, work_date, credited_leave_type_id, credited_days, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, holiday.rows[0].id, work_date, leaveTypeId, days, notes, req.user.id]
    );

    await client.query(
      `INSERT INTO leave_balances (user_id, leave_type_id, year, allocated, used, remaining, carried_forward)
       VALUES ($1, $2, $3, 0, 0, $4, $4)
       ON CONFLICT (user_id, leave_type_id, year)
       DO UPDATE SET carried_forward = leave_balances.carried_forward + $4,
                     remaining = leave_balances.remaining + $4,
                     updated_at = NOW()`,
      [user_id, leaveTypeId, year, days]
    );

    await client.query('COMMIT');
    res.status(201).json({
      message: `${days} compensatory off day(s) credited for holiday work.`,
      credit: credit.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Comp-off has already been credited for this user and holiday.' });
    }
    console.error('Credit holiday work error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// POST /api/admin/carry-forward - process year-end carry-forward
const processCarryForward = async (req, res) => {
  const client = await pool.connect();
  try {
    const fromYear = parseInt(req.body.from_year || new Date().getFullYear(), 10);
    const toYear = parseInt(req.body.to_year || fromYear + 1, 10);

    await client.query('BEGIN');
    const rows = await runCarryForward(client, fromYear, toYear);
    await client.query('COMMIT');

    res.json({
      message: `Carry-forward processed from ${fromYear} to ${toYear}.`,
      balances_created_or_updated: rows.length,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Carry-forward error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
};

module.exports = {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  getUsers,
  createUser,
  updateUser,
  getPayroll,
  getAllLeaves,
  getStats,
  creditHolidayWork,
  processCarryForward,
  runCarryForward,
};
