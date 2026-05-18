/**
 * Seed script - creates demo data with properly hashed passwords.
 * Run: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const USERS = [
  { id: 'a0000000-0000-0000-0000-000000000001', name: 'System Admin', email: 'admin@company.com', password: 'admin123', role: 'admin', joining_date: '2020-01-01', monthly_salary: 100000, manager_id: null },
  { id: 'b0000000-0000-0000-0000-000000000001', name: 'Rahul Sharma', email: 'rahul.sharma@company.com', password: 'manager123', role: 'manager', joining_date: '2021-03-15', monthly_salary: 90000, manager_id: null },
  { id: 'b0000000-0000-0000-0000-000000000002', name: 'Priya Patel', email: 'priya.patel@company.com', password: 'manager123', role: 'manager', joining_date: '2021-06-01', monthly_salary: 85000, manager_id: null },
  { id: 'c0000000-0000-0000-0000-000000000001', name: 'Amit Kumar', email: 'amit.kumar@company.com', password: 'employee123', role: 'employee', joining_date: '2022-01-10', monthly_salary: 60000, manager_id: 'b0000000-0000-0000-0000-000000000001' },
  { id: 'c0000000-0000-0000-0000-000000000002', name: 'Sneha Reddy', email: 'sneha.reddy@company.com', password: 'employee123', role: 'employee', joining_date: '2022-04-20', monthly_salary: 55000, manager_id: 'b0000000-0000-0000-0000-000000000001' },
  { id: 'c0000000-0000-0000-0000-000000000003', name: 'Vikram Singh', email: 'vikram.singh@company.com', password: 'employee123', role: 'employee', joining_date: '2023-02-01', monthly_salary: 58000, manager_id: 'b0000000-0000-0000-0000-000000000001' },
  { id: 'c0000000-0000-0000-0000-000000000004', name: 'Neha Gupta', email: 'neha.gupta@company.com', password: 'employee123', role: 'employee', joining_date: '2023-07-15', monthly_salary: 52000, manager_id: 'b0000000-0000-0000-0000-000000000002' },
  { id: 'c0000000-0000-0000-0000-000000000005', name: 'Arjun Das', email: 'arjun.das@company.com', password: 'employee123', role: 'employee', joining_date: '2024-01-08', monthly_salary: 50000, manager_id: 'b0000000-0000-0000-0000-000000000002' },
];

function printDatabaseSetupHelp(error) {
  if (error.code === 'ENOTFOUND') {
    console.error(`Database host not found: ${error.hostname}`);
    console.error('Update DATABASE_URL in backend/.env with the current Supabase connection string.');
    console.error('Use Supabase Dashboard > Settings > Database > Connection string > URI.');
    console.error('The pooler URL usually looks like:');
    console.error('postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres');
    return;
  }

  console.error('Seed failed:', error.message);
}

async function seed() {
  let client;

  try {
    client = await pool.connect();
    console.log('Starting seed...');
    await client.query('BEGIN');

    for (const user of USERS) {
      const hash = await bcrypt.hash(user.password, 10);
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, joining_date, monthly_salary, manager_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET password_hash = $4`,
        [user.id, user.name, user.email, hash, user.role, user.joining_date, user.monthly_salary, user.manager_id]
      );
    }
    console.log('Users seeded');

    await client.query(`INSERT INTO leave_types (id,name,annual_quota,carry_forward_max,is_paid,description) VALUES
      ('d0000000-0000-0000-0000-000000000001','Casual Leave',12,3,TRUE,'Personal or short breaks'),
      ('d0000000-0000-0000-0000-000000000002','Sick Leave',10,0,TRUE,'Illness or medical'),
      ('d0000000-0000-0000-0000-000000000003','Earned Leave',15,5,TRUE,'Privileged, carry-forward'),
      ('d0000000-0000-0000-0000-000000000004','Loss of Pay',0,0,FALSE,'Unpaid leave')
      ON CONFLICT (id) DO NOTHING`);
    console.log('Leave types seeded');

    await client.query(`INSERT INTO holidays (date, name, is_optional) VALUES
      ('2026-01-26','Republic Day',FALSE),('2026-03-17','Holi',FALSE),
      ('2026-04-03','Good Friday',FALSE),('2026-04-20','Eid ul-Fitr',FALSE),
      ('2026-05-01','May Day',FALSE),('2026-08-15','Independence Day',FALSE),
      ('2026-08-25','Janmashtami',FALSE),('2026-10-02','Gandhi Jayanti',FALSE),
      ('2026-10-12','Dussehra',FALSE),('2026-10-31','Diwali',FALSE),
      ('2026-11-19','Guru Nanak Jayanti',FALSE),('2026-12-25','Christmas',FALSE),
      ('2026-01-14','Pongal',TRUE),('2026-06-27','Eid ul-Adha',TRUE)
      ON CONFLICT (date) DO NOTHING`);
    console.log('Holidays seeded');

    const leaveTypeIds = [
      'd0000000-0000-0000-0000-000000000001',
      'd0000000-0000-0000-0000-000000000002',
      'd0000000-0000-0000-0000-000000000003',
    ];
    const quotas = [12, 10, 15];
    const nonAdminUsers = USERS.filter((user) => user.role !== 'admin');

    for (const user of nonAdminUsers) {
      for (let i = 0; i < leaveTypeIds.length; i++) {
        await client.query(
          `INSERT INTO leave_balances (user_id, leave_type_id, year, allocated, used, remaining)
           VALUES ($1,$2,2026,$3,0,$3)
           ON CONFLICT ON CONSTRAINT uq_leave_balance DO NOTHING`,
          [user.id, leaveTypeIds[i], quotas[i]]
        );
      }
    }
    console.log('Leave balances seeded');

    await client.query('COMMIT');
    console.log('Seed complete!');
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    printDatabaseSetupHelp(error);
    process.exitCode = 1;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

seed();
