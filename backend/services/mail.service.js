const nodemailer = require('nodemailer');
const pool = require('../config/db');
const { getLeaveAppliedTemplate, getLeaveApprovedTemplate, getLeaveRejectedTemplate, getLeaveCancelledTemplate } = require('./emailTemplates');
require('dotenv').config();

// ─── SMTP Transporter ───
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup
transporter.verify()
  .then(() => console.log('📧 Mail server connected'))
  .catch((err) => console.warn('⚠️ Mail server not configured:', err.message));

/**
 * Log notification to database
 */
async function logNotification(userId, leaveId, type, emailTo, status, errorMsg = null) {
  try {
    await pool.query(
      `INSERT INTO notification_logs (user_id, leave_id, notification_type, email_to, email_status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, leaveId, type, emailTo, status, errorMsg]
    );
  } catch (err) {
    console.error('Failed to log notification:', err.message);
  }
}

/**
 * Send an email and log the result
 */
async function sendEmail(to, subject, html, userId, leaveId, type) {
  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com') {
      console.log(`📧 [MOCK] Email to ${to}: ${subject}`);
      await logNotification(userId, leaveId, type, to, 'mocked');
      return { success: true, mocked: true };
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${to}: ${subject}`);
    await logNotification(userId, leaveId, type, to, 'sent');
    return { success: true };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    await logNotification(userId, leaveId, type, to, 'failed', error.message);
    return { success: false, error: error.message };
  }
}

// ─── PUBLIC METHODS ───

/**
 * Notify manager when employee applies for leave
 */
async function sendLeaveAppliedEmail({ employeeName, employeeEmail, managerEmail, managerName, leaveTypeName, fromDate, toDate, totalDays, reason, leaveId, userId }) {
  const subject = `🔔 New Leave Request from ${employeeName}`;
  const html = getLeaveAppliedTemplate({
    employeeName, managerName, leaveTypeName, fromDate, toDate, totalDays, reason,
  });
  return sendEmail(managerEmail, subject, html, userId, leaveId, 'leave_applied');
}

/**
 * Notify employee when leave is approved
 */
async function sendLeaveApprovedEmail({ employeeEmail, employeeName, managerName, leaveTypeName, fromDate, toDate, totalDays, remark, remainingBalance, lopDays, deductionAmount, leaveId, userId }) {
  const subject = `✅ Leave Approved — ${leaveTypeName}`;
  const html = getLeaveApprovedTemplate({
    employeeName, managerName, leaveTypeName, fromDate, toDate, totalDays, remark,
    remainingBalance, lopDays, deductionAmount,
  });
  return sendEmail(employeeEmail, subject, html, userId, leaveId, 'leave_approved');
}

/**
 * Notify employee when leave is rejected
 */
async function sendLeaveRejectedEmail({ employeeEmail, employeeName, managerName, leaveTypeName, fromDate, toDate, totalDays, remark, leaveId, userId }) {
  const subject = `❌ Leave Rejected — ${leaveTypeName}`;
  const html = getLeaveRejectedTemplate({
    employeeName, managerName, leaveTypeName, fromDate, toDate, totalDays, remark,
  });
  return sendEmail(employeeEmail, subject, html, userId, leaveId, 'leave_rejected');
}

/**
 * Notify manager when employee cancels leave
 */
async function sendLeaveCancelledEmail({ employeeName, managerEmail, managerName, leaveTypeName, fromDate, toDate, totalDays, leaveId, userId }) {
  const subject = `🚫 Leave Cancelled by ${employeeName}`;
  const html = getLeaveCancelledTemplate({
    employeeName, managerName, leaveTypeName, fromDate, toDate, totalDays,
  });
  return sendEmail(managerEmail, subject, html, userId, leaveId, 'leave_cancelled');
}

module.exports = {
  sendLeaveAppliedEmail,
  sendLeaveApprovedEmail,
  sendLeaveRejectedEmail,
  sendLeaveCancelledEmail,
};
