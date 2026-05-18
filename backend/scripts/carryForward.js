require('dotenv').config();
const pool = require('../config/db');
const { ensureBonusSchema } = require('../utils/migrations');
const { runCarryForward } = require('../controllers/admin.controller');

async function main() {
  const fromYear = parseInt(process.argv[2] || new Date().getFullYear(), 10);
  const toYear = parseInt(process.argv[3] || fromYear + 1, 10);
  const client = await pool.connect();

  try {
    await ensureBonusSchema();
    await client.query('BEGIN');
    const rows = await runCarryForward(client, fromYear, toYear);
    await client.query('COMMIT');
    console.log(`Carry-forward processed from ${fromYear} to ${toYear}.`);
    console.log(`${rows.length} balances created or updated.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Carry-forward job failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
