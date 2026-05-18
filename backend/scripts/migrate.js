require('dotenv').config();
const pool = require('../config/db');
const { ensureBonusSchema } = require('../utils/migrations');

async function migrate() {
  try {
    console.log('Running bonus feature migrations...');
    await ensureBonusSchema();
    console.log('Migrations complete.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
