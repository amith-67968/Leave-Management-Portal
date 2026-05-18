const pool = require('../config/db');
const { calculateWorkingDays } = require('../utils/dateUtils');
const { BadRequestError, NotFoundError, ForbiddenError, ConflictError } = require('../utils/errors');
const { sendLeaveAppliedEmail, sendLeaveApprovedEmail, sendLeaveRejectedEmail, sendLeaveCancelledEmail } = require('../services/mail.service');

// POST /api/leaves — Apply for leave
const applyLeave = async (req, res) => {
  const client = await pool.connect();
  try {
    const { leave_type_id, from_date, to_date, reason } = req.body;
    const userId = req.user.id;

    if (!leave_type_id || !from_date || !to_date || !reason) {
      return res.status(400).json({ error: 'leave_type_id, from_date, to_date, and reason are required.' });
    }

    if (new Date(to_date) < new Date(from_date)) {
      return res.status(400).json({ error: 'to_date must be on or after from_date.' });
    }

    // Calculate working days (excludes weekends and holidays)
    const totalDays = await calculateWorkingDays(from_date, to_date);
    if (totalDays <= 0) {
      return res.status(400).json({ error: 'No working days in the selected range (all weekends/holidays).' });
    }

    await client.query('BEGIN');

    // Check for overlapping leaves
    const overlapCheck = await client.query(
      `SELECT id FROM leaves
       WHERE user_id = $1 AND status IN ('pending', 'approved')
       AND from_date <= $3 AND to_date >= $2`,
      [userId, from_date, to_date]
    );
    if (overlapCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'You already have a leave request overlapping with these dates.' });
    }

    // Verify leave type exists
    const leaveType = await client.query('SELECT id, name FROM leave_types WHERE id = $1 AND is_active = TRUE', [leave_type_id]);
    if (leaveType.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Leave type not found.' });
    }

    // Insert the leave request
    const result = await client.query(
      `INSERT INTO leaves (user_id, leave_type_id, from_date, to_date, total_days, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [userId, leave_type_id, from_date, to_date, totalDays, reason]
    );

    await client.query('COMMIT');

    // ── Send email to manager (after successful commit) ──
    const managerResult = await pool.query(
      `SELECT u.name as emp_name, u.email as emp_email, m.name as mgr_name, m.email as mgr_email
       FROM users u LEFT JOIN users m ON u.manager_id = m.id WHERE u.id = $1`,
      [userId]
    );
    if (managerResult.rows.length > 0 && managerResult.rows[0].mgr_email) {
      const r = managerResult.rows[0];
      sendLeaveAppliedEmail({
        employeeName: r.emp_name,
        employeeEmail: r.emp_email,
        managerEmail: r.mgr_email,
        managerName: r.mgr_name,
        leaveTypeName: leaveType.rows[0].name,
        fromDate: from_date,
        toDate: to_date,
        totalDays,
        reason,
        leaveId: result.rows[0].id,
        userId,
      }).catch(err => console.error('Email send failed (non-blocking):', err.message));
    }

    res.status(201).json({
      message: 'Leave request submitted successfully.',
      leave: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Apply leave error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// GET /api/leaves/my — My leave history
const getMyLeaves = async (req, res) => {
  try {
    const { status, year } = req.query;
    let query = `
      SELECT l.*, lt.name as leave_type_name, lt.is_paid,
             u.name as decided_by_name
      FROM leaves l
      JOIN leave_types lt ON l.leave_type_id = lt.id
      LEFT JOIN users u ON l.decided_by = u.id
      WHERE l.user_id = $1`;
    const params = [req.user.id];
    let paramIdx = 2;

    if (status) {
      query += ` AND l.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }
    if (year) {
      query += ` AND EXTRACT(YEAR FROM l.from_date) = $${paramIdx}`;
      params.push(parseInt(year));
    }

    query += ' ORDER BY l.applied_at DESC';
    const result = await pool.query(query, params);
    res.json({ leaves: result.rows });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/leaves/team — Team leaves (manager)
const getTeamLeaves = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT l.*, lt.name as leave_type_name, lt.is_paid,
             u.name as employee_name, u.email as employee_email
      FROM leaves l
      JOIN leave_types lt ON l.leave_type_id = lt.id
      JOIN users u ON l.user_id = u.id
      WHERE u.manager_id = $1`;
    const params = [managerId];

    if (status) {
      query += ` AND l.status = $2`;
      params.push(status);
    }

    query += ' ORDER BY l.applied_at DESC';
    const result = await pool.query(query, params);
    res.json({ leaves: result.rows });
  } catch (error) {
    console.error('Get team leaves error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// PATCH /api/leaves/:id/approve — Approve a leave
const approveLeave = async (req, res) => {
  const client = await pool.connect();
  try {
    const leaveId = req.params.id;
    const managerId = req.user.id;

    await client.query('BEGIN');

    // Get the leave with user info
    const leaveResult = await client.query(
      `SELECT l.*, u.manager_id, u.monthly_salary, u.name as employee_name, u.email as employee_email,
              lt.is_paid, lt.name as leave_type_name
       FROM leaves l
       JOIN users u ON l.user_id = u.id
       JOIN leave_types lt ON l.leave_type_id = lt.id
       WHERE l.id = $1`,
      [leaveId]
    );

    if (leaveResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    const leave = leaveResult.rows[0];

    // Self-approval check
    if (leave.user_id === managerId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'You cannot approve your own leave.' });
    }

    // Manager hierarchy check (admin can approve anyone)
    if (req.user.role !== 'admin' && leave.manager_id !== managerId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'You are not authorized to approve this leave.' });
    }

    if (leave.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Cannot approve a leave that is already ${leave.status}.` });
    }

    const approvalRemark = req.body.remark || 'Approved';

    // Update leave status
    await client.query(
      `UPDATE leaves SET status = 'approved', decided_by = $1, decided_at = NOW(), decision_remark = $2
       WHERE id = $3`,
      [managerId, approvalRemark, leaveId]
    );

    // Deduct from leave balance
    const year = new Date(leave.from_date).getFullYear();
    const balanceResult = await client.query(
      `SELECT * FROM leave_balances WHERE user_id = $1 AND leave_type_id = $2 AND year = $3`,
      [leave.user_id, leave.leave_type_id, year]
    );

    let remainingBalance = null;
    let lopDays = 0;
    let deductionAmount = 0;

    if (balanceResult.rows.length > 0) {
      const balance = balanceResult.rows[0];
      const newUsed = parseFloat(balance.used) + parseFloat(leave.total_days);
      const newRemaining = parseFloat(balance.allocated) + parseFloat(balance.carried_forward) - newUsed;
      remainingBalance = Math.max(newRemaining, 0);

      await client.query(
        `UPDATE leave_balances SET used = $1, remaining = GREATEST($2, 0) WHERE id = $3`,
        [newUsed, newRemaining, balance.id]
      );

      // Check if LOP applies (paid leave exceeded)
      if (leave.is_paid && newRemaining < 0) {
        lopDays = Math.abs(newRemaining);
        const perDaySalary = leave.monthly_salary / 30;
        deductionAmount = perDaySalary * lopDays;
        const month = new Date(leave.from_date).getMonth() + 1;

        // Upsert payroll log
        await client.query(
          `INSERT INTO payroll_logs (user_id, month, year, lop_days, deduction_amount, final_salary)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (user_id, month, year)
           DO UPDATE SET lop_days = payroll_logs.lop_days + $4,
                         deduction_amount = payroll_logs.deduction_amount + $5,
                         final_salary = $7 - (payroll_logs.deduction_amount + $5),
                         generated_at = NOW()`,
          [leave.user_id, month, year, lopDays, deductionAmount, leave.monthly_salary - deductionAmount, leave.monthly_salary]
        );
      }
    }

    await client.query('COMMIT');

    // ── Send approval email to employee (after successful commit) ──
    sendLeaveApprovedEmail({
      employeeEmail: leave.employee_email,
      employeeName: leave.employee_name,
      managerName: req.user.name,
      leaveTypeName: leave.leave_type_name,
      fromDate: leave.from_date,
      toDate: leave.to_date,
      totalDays: leave.total_days,
      remark: approvalRemark,
      remainingBalance,
      lopDays: lopDays > 0 ? lopDays : null,
      deductionAmount: deductionAmount > 0 ? deductionAmount : null,
      leaveId,
      userId: leave.user_id,
    }).catch(err => console.error('Email send failed (non-blocking):', err.message));

    res.json({ message: 'Leave approved successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Approve leave error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// PATCH /api/leaves/:id/reject — Reject a leave
const rejectLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const managerId = req.user.id;
    const { remark } = req.body;

    if (!remark || remark.trim() === '') {
      return res.status(400).json({ error: 'Rejection remark is mandatory.' });
    }

    const leaveResult = await pool.query(
      `SELECT l.*, u.manager_id, u.name as employee_name, u.email as employee_email,
              lt.name as leave_type_name
       FROM leaves l
       JOIN users u ON l.user_id = u.id
       JOIN leave_types lt ON l.leave_type_id = lt.id
       WHERE l.id = $1`,
      [leaveId]
    );

    if (leaveResult.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    const leave = leaveResult.rows[0];

    if (leave.user_id === managerId) {
      return res.status(403).json({ error: 'You cannot reject your own leave.' });
    }

    if (req.user.role !== 'admin' && leave.manager_id !== managerId) {
      return res.status(403).json({ error: 'You are not authorized to reject this leave.' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: `Cannot reject a leave that is already ${leave.status}.` });
    }

    await pool.query(
      `UPDATE leaves SET status = 'rejected', decided_by = $1, decided_at = NOW(), decision_remark = $2
       WHERE id = $3`,
      [managerId, remark, leaveId]
    );

    // ── Send rejection email to employee (after successful update) ──
    sendLeaveRejectedEmail({
      employeeEmail: leave.employee_email,
      employeeName: leave.employee_name,
      managerName: req.user.name,
      leaveTypeName: leave.leave_type_name,
      fromDate: leave.from_date,
      toDate: leave.to_date,
      totalDays: leave.total_days,
      remark,
      leaveId,
      userId: leave.user_id,
    }).catch(err => console.error('Email send failed (non-blocking):', err.message));

    res.json({ message: 'Leave rejected.' });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// DELETE /api/leaves/:id — Cancel a pending leave
const cancelLeave = async (req, res) => {
  const client = await pool.connect();
  try {
    const leaveId = req.params.id;
    const userId = req.user.id;

    await client.query('BEGIN');

    const leaveResult = await client.query(
      `SELECT l.*, lt.name as leave_type_name
       FROM leaves l
       JOIN leave_types lt ON l.leave_type_id = lt.id
       WHERE l.id = $1 AND l.user_id = $2`,
      [leaveId, userId]
    );
    if (leaveResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Leave not found.' });
    }

    const leave = leaveResult.rows[0];

    if (leave.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Leave is already cancelled.' });
    }

    // If it was approved, restore balance
    if (leave.status === 'approved') {
      const year = new Date(leave.from_date).getFullYear();
      await client.query(
        `UPDATE leave_balances
         SET used = GREATEST(used - $1, 0), remaining = remaining + $1
         WHERE user_id = $2 AND leave_type_id = $3 AND year = $4`,
        [leave.total_days, userId, leave.leave_type_id, year]
      );
    }

    if (leave.status !== 'pending' && leave.status !== 'approved') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Only pending or approved leaves can be cancelled.' });
    }

    await client.query(`UPDATE leaves SET status = 'cancelled' WHERE id = $1`, [leaveId]);
    await client.query('COMMIT');

    // ── Send cancellation email to manager (after successful commit) ──
    const managerResult = await pool.query(
      `SELECT m.name as mgr_name, m.email as mgr_email
       FROM users u JOIN users m ON u.manager_id = m.id WHERE u.id = $1`,
      [userId]
    );
    if (managerResult.rows.length > 0 && managerResult.rows[0].mgr_email) {
      const mgr = managerResult.rows[0];
      sendLeaveCancelledEmail({
        employeeName: req.user.name,
        managerEmail: mgr.mgr_email,
        managerName: mgr.mgr_name,
        leaveTypeName: leave.leave_type_name,
        fromDate: leave.from_date,
        toDate: leave.to_date,
        totalDays: leave.total_days,
        leaveId,
        userId,
      }).catch(err => console.error('Email send failed (non-blocking):', err.message));
    }

    res.json({ message: 'Leave cancelled successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel leave error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
};

// GET /api/leaves/balance — My balance per leave type
const getMyBalance = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const result = await pool.query(
      `SELECT lb.*, lt.name as leave_type_name, lt.is_paid
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.user_id = $1 AND lb.year = $2
       ORDER BY lt.name`,
      [req.user.id, year]
    );
    res.json({ balances: result.rows, year });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/leaves/salary-summary — Employee salary deduction summary
const getSalarySummary = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const result = await pool.query(
      `SELECT pl.*, u.monthly_salary, u.name
       FROM payroll_logs pl
       JOIN users u ON pl.user_id = u.id
       WHERE pl.user_id = $1 AND pl.year = $2
       ORDER BY pl.month`,
      [req.user.id, year]
    );
    res.json({ salary_summary: result.rows, year });
  } catch (error) {
    console.error('Get salary summary error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getMyBalance,
  getSalarySummary,
};
