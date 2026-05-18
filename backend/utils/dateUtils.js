const pool = require('../config/db');

/**
 * Calculate the number of working days between two dates,
 * excluding weekends (Sat/Sun) and company holidays.
 */
async function calculateWorkingDays(fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);

  // Fetch holidays in the date range
  const holidayResult = await pool.query(
    `SELECT date FROM holidays WHERE date BETWEEN $1 AND $2 AND is_optional = FALSE`,
    [fromDate, toDate]
  );
  const holidayDates = new Set(
    holidayResult.rows.map((h) => h.date.toISOString().split('T')[0])
  );

  let workingDays = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split('T')[0];

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(dateStr)) {
      workingDays++;
    }

    current.setDate(current.getDate() + 1);
  }

  return workingDays;
}

/**
 * Check if a given date is a weekend
 */
function isWeekend(date) {
  const d = new Date(date);
  return d.getDay() === 0 || d.getDay() === 6;
}

/**
 * Check if a given date is a holiday
 */
async function isHoliday(date) {
  const result = await pool.query(
    `SELECT id FROM holidays WHERE date = $1 AND is_optional = FALSE`,
    [date]
  );
  return result.rows.length > 0;
}

/**
 * Format date to YYYY-MM-DD string
 */
function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

module.exports = {
  calculateWorkingDays,
  isWeekend,
  isHoliday,
  formatDate,
};
