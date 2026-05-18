/**
 * Professional HTML email templates for leave notifications.
 * All templates share a consistent HR-system style.
 */

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

function baseTemplate(title, bodyContent) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">🏖️ LeavePort</h1>
            <p style="margin:4px 0 0;color:#c7d2fe;font-size:13px;">Leave Management Portal</p>
          </td>
        </tr>
        <!-- Title Bar -->
        <tr>
          <td style="padding:24px 32px 0;">
            <h2 style="margin:0;font-size:18px;color:#1e293b;">${title}</h2>
            <hr style="border:none;border-top:2px solid #e2e8f0;margin:16px 0;">
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:0 32px 24px;">
            ${bodyContent}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              This is an automated notification from LeavePort.<br>
              Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function detailRow(label, value, color = '#1e293b') {
  return `
    <tr>
      <td style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:600;width:140px;vertical-align:top;">${label}</td>
      <td style="padding:8px 12px;font-size:14px;color:${color};font-weight:500;">${value}</td>
    </tr>`;
}

function detailsTable(rows) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;">${rows}</table>`;
}

// ─── LEAVE APPLIED (sent to Manager) ───
function getLeaveAppliedTemplate({ employeeName, managerName, leaveTypeName, fromDate, toDate, totalDays, reason }) {
  const body = `
    <p style="font-size:14px;color:#334155;line-height:1.6;">
      Hi <strong>${managerName}</strong>,
    </p>
    <p style="font-size:14px;color:#334155;line-height:1.6;">
      A new leave request has been submitted and is <strong>pending your approval</strong>.
    </p>
    ${detailsTable(
      detailRow('Employee', employeeName) +
      detailRow('Leave Type', leaveTypeName) +
      detailRow('From', formatDate(fromDate)) +
      detailRow('To', formatDate(toDate)) +
      detailRow('Total Days', `<strong>${totalDays} working day(s)</strong>`) +
      detailRow('Reason', reason)
    )}
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
        ⚡ Action Required — Please Review
      </span>
    </div>
    <p style="font-size:13px;color:#64748b;">Log in to your LeavePort dashboard to approve or reject this request.</p>
  `;
  return baseTemplate('📋 New Leave Request Submitted', body);
}

// ─── LEAVE APPROVED (sent to Employee) ───
function getLeaveApprovedTemplate({ employeeName, managerName, leaveTypeName, fromDate, toDate, totalDays, remark, remainingBalance, lopDays, deductionAmount }) {
  let salarySection = '';
  if (lopDays && lopDays > 0) {
    salarySection = `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 16px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#991b1b;">⚠️ Salary Deduction Notice</p>
      <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.5;">
        Your paid leave balance was exceeded by <strong>${lopDays} day(s)</strong>.<br>
        A salary deduction of <strong>₹${parseFloat(deductionAmount).toLocaleString()}</strong> will be applied.
      </p>
    </div>`;
  }

  const body = `
    <p style="font-size:14px;color:#334155;line-height:1.6;">
      Hi <strong>${employeeName}</strong>,
    </p>
    <p style="font-size:14px;color:#334155;line-height:1.6;">
      Great news! Your leave request has been <span style="color:#059669;font-weight:700;">approved</span>.
    </p>
    ${detailsTable(
      detailRow('Leave Type', leaveTypeName) +
      detailRow('From', formatDate(fromDate)) +
      detailRow('To', formatDate(toDate)) +
      detailRow('Total Days', `<strong>${totalDays} working day(s)</strong>`) +
      detailRow('Approved By', managerName) +
      detailRow('Remark', remark || 'Approved') +
      (remainingBalance !== undefined ? detailRow('Remaining Balance', `${remainingBalance} day(s)`, '#4f46e5') : '')
    )}
    ${salarySection}
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#059669,#10b981);color:#fff;border-radius:8px;font-size:14px;font-weight:600;">
        ✅ Leave Approved
      </span>
    </div>
  `;
  return baseTemplate('✅ Leave Request Approved', body);
}

// ─── LEAVE REJECTED (sent to Employee) ───
function getLeaveRejectedTemplate({ employeeName, managerName, leaveTypeName, fromDate, toDate, totalDays, remark }) {
  const body = `
    <p style="font-size:14px;color:#334155;line-height:1.6;">
      Hi <strong>${employeeName}</strong>,
    </p>
    <p style="font-size:14px;color:#334155;line-height:1.6;">
      Unfortunately, your leave request has been <span style="color:#dc2626;font-weight:700;">rejected</span>.
    </p>
    ${detailsTable(
      detailRow('Leave Type', leaveTypeName) +
      detailRow('From', formatDate(fromDate)) +
      detailRow('To', formatDate(toDate)) +
      detailRow('Total Days', `<strong>${totalDays} working day(s)</strong>`) +
      detailRow('Rejected By', managerName) +
      detailRow('Reason for Rejection', `<strong style="color:#dc2626;">${remark}</strong>`)
    )}
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;border-radius:8px;font-size:14px;font-weight:600;">
        ❌ Leave Rejected
      </span>
    </div>
    <p style="font-size:13px;color:#64748b;">Please check your dashboard for more details or contact your manager.</p>
  `;
  return baseTemplate('❌ Leave Request Rejected', body);
}

// ─── LEAVE CANCELLED (sent to Manager) ───
function getLeaveCancelledTemplate({ employeeName, managerName, leaveTypeName, fromDate, toDate, totalDays }) {
  const body = `
    <p style="font-size:14px;color:#334155;line-height:1.6;">
      Hi <strong>${managerName}</strong>,
    </p>
    <p style="font-size:14px;color:#334155;line-height:1.6;">
      <strong>${employeeName}</strong> has cancelled their leave request.
    </p>
    ${detailsTable(
      detailRow('Employee', employeeName) +
      detailRow('Leave Type', leaveTypeName) +
      detailRow('From', formatDate(fromDate)) +
      detailRow('To', formatDate(toDate)) +
      detailRow('Total Days', `<strong>${totalDays} working day(s)</strong>`) +
      detailRow('Status', '<span style="color:#64748b;font-weight:700;">Cancelled</span>')
    )}
    <p style="font-size:13px;color:#64748b;margin-top:16px;">No action is required from your side.</p>
  `;
  return baseTemplate('🚫 Leave Request Cancelled', body);
}

module.exports = {
  getLeaveAppliedTemplate,
  getLeaveApprovedTemplate,
  getLeaveRejectedTemplate,
  getLeaveCancelledTemplate,
};
