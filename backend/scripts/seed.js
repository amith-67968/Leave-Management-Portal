/**
 * Seed script — creates demo data with properly hashed passwords.
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

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting seed...');
    await client.query('BEGIN');

    // Insert users with hashed passwords
    for (const u of USERS) {
      const hash = await bcrypt.hash(u.password, 10);
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, joining_date, monthly_salary, manager_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO UPDATE SET password_hash = $4`,
        [u.id, u.name, u.email, hash, u.role, u.joining_date, u.monthly_salary, u.manager_id]
      );
    }
    console.log('✅ Users seeded');

    // Leave types
    await client.query(`INSERT INTO leave_types (id,name,annual_quota,carry_forward_max,is_paid,description) VALUES
      ('d0000000-0000-0000-0000-000000000001','Casual Leave',12,3,TRUE,'Personal or short breaks'),
      ('d0000000-0000-0000-0000-000000000002','Sick Leave',10,0,TRUE,'Illness or medical'),
      ('d0000000-0000-0000-0000-000000000003','Earned Leave',15,5,TRUE,'Privileged, carry-forward'),
      ('d0000000-0000-0000-0000-000000000004','Loss of Pay',0,0,FALSE,'Unpaid leave')
      ON CONFLICT (id) DO NOTHING`);
    console.log('✅ Leave types seeded');

    // Holidays
    await client.query(`INSERT INTO holidays (date, name, is_optional) VALUES
      ('2026-01-26','Republic Day',FALSE),('2026-03-17','Holi',FALSE),
      ('2026-04-03','Good Friday',FALSE),('2026-04-20','Eid ul-Fitr',FALSE),
      ('2026-05-01','May Day',FALSE),('2026-08-15','Independence Day',FALSE),
      ('2026-08-25','Janmashtami',FALSE),('2026-10-02','Gandhi Jayanti',FALSE),
      ('2026-10-12','Dussehra',FALSE),('2026-10-31','Diwali',FALSE),
      ('2026-11-19','Guru Nanak Jayanti',FALSE),('2026-12-25','Christmas',FALSE),
      ('2026-01-14','Pongal',TRUE),('2026-06-27','Eid ul-Adha',TRUE)
      ON CONFLICT (date) DO NOTHING`);
    console.log('✅ Holidays seeded');

    // Leave balances for all non-admin users
    const leaveTypeIds = ['d0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000003'];
    const quotas = [12, 10, 15];
    const nonAdmin = USERS.filter(u => u.role !== 'admin');
    for (const u of nonAdmin) {
      for (let i = 0; i < leaveTypeIds.length; i++) {
        await client.query(
          `INSERT INTO leave_balances (user_id, leave_type_id, year, allocated, used, remaining)
           VALUES ($1,$2,2026,$3,0,$3) ON CONFLICT ON CONSTRAINT uq_leave_balance DO NOTHING`,
          [u.id, leaveTypeIds[i], quotas[i]]
        );
      }
    }
    console.log('✅ Leave balances seeded');

    await client.query('COMMIT');
    console.log('🎉 Seed complete!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
