-- ============================================
-- Leave Management Portal — Seed Data
-- ============================================
-- DEMO USERS: admin@company.com/admin123, rahul.sharma@company.com/manager123,
-- priya.patel@company.com/manager123, amit.kumar@company.com/employee123,
-- sneha.reddy@company.com/employee123, vikram.singh@company.com/employee123,
-- neha.gupta@company.com/employee123, arjun.das@company.com/employee123

-- NOTE: Passwords will be hashed at runtime by the backend seeder script.
-- This SQL uses placeholder hashes. Run "npm run seed" from backend/ instead.

-- USERS
INSERT INTO users (id, name, email, password_hash, role, joining_date, monthly_salary) VALUES
('a0000000-0000-0000-0000-000000000001','System Admin','admin@company.com','PLACEHOLDER','admin','2020-01-01',100000);
INSERT INTO users (id, name, email, password_hash, role, joining_date, monthly_salary) VALUES
('b0000000-0000-0000-0000-000000000001','Rahul Sharma','rahul.sharma@company.com','PLACEHOLDER','manager','2021-03-15',90000);
INSERT INTO users (id, name, email, password_hash, role, joining_date, monthly_salary) VALUES
('b0000000-0000-0000-0000-000000000002','Priya Patel','priya.patel@company.com','PLACEHOLDER','manager','2021-06-01',85000);
INSERT INTO users (id, name, email, password_hash, manager_id, role, joining_date, monthly_salary) VALUES
('c0000000-0000-0000-0000-000000000001','Amit Kumar','amit.kumar@company.com','PLACEHOLDER','b0000000-0000-0000-0000-000000000001','employee','2022-01-10',60000),
('c0000000-0000-0000-0000-000000000002','Sneha Reddy','sneha.reddy@company.com','PLACEHOLDER','b0000000-0000-0000-0000-000000000001','employee','2022-04-20',55000),
('c0000000-0000-0000-0000-000000000003','Vikram Singh','vikram.singh@company.com','PLACEHOLDER','b0000000-0000-0000-0000-000000000001','employee','2023-02-01',58000),
('c0000000-0000-0000-0000-000000000004','Neha Gupta','neha.gupta@company.com','PLACEHOLDER','b0000000-0000-0000-0000-000000000002','employee','2023-07-15',52000),
('c0000000-0000-0000-0000-000000000005','Arjun Das','arjun.das@company.com','PLACEHOLDER','b0000000-0000-0000-0000-000000000002','employee','2024-01-08',50000);

-- LEAVE TYPES
INSERT INTO leave_types (id, name, annual_quota, carry_forward_max, is_paid, description) VALUES
('d0000000-0000-0000-0000-000000000001','Casual Leave',12,3,TRUE,'Personal work, family events, or short breaks'),
('d0000000-0000-0000-0000-000000000002','Sick Leave',10,0,TRUE,'Illness or medical procedures'),
('d0000000-0000-0000-0000-000000000003','Earned Leave',15,5,TRUE,'Privileged leave, can be carried forward'),
('d0000000-0000-0000-0000-000000000004','Loss of Pay',0,0,FALSE,'Unpaid leave when paid balance exhausted');

-- HOLIDAYS 2026 (India)
INSERT INTO holidays (date, name, is_optional) VALUES
('2026-01-14','Pongal / Makar Sankranti',TRUE),('2026-01-26','Republic Day',FALSE),
('2026-03-17','Holi',FALSE),('2026-04-03','Good Friday',FALSE),
('2026-04-20','Eid ul-Fitr',FALSE),('2026-05-01','May Day',FALSE),
('2026-06-27','Eid ul-Adha',TRUE),('2026-08-15','Independence Day',FALSE),
('2026-08-25','Janmashtami',FALSE),('2026-10-02','Gandhi Jayanti',FALSE),
('2026-10-12','Dussehra',FALSE),('2026-10-31','Diwali',FALSE),
('2026-11-19','Guru Nanak Jayanti',FALSE),('2026-12-25','Christmas',FALSE);

-- LEAVE BALANCES 2026 (all users × paid leave types)
INSERT INTO leave_balances (user_id, leave_type_id, year, allocated, used, remaining, carried_forward) VALUES
('b0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000001',2026,12,2,10,0),
('b0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000002',2026,10,0,10,0),
('b0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000003',2026,15,3,12,0),
('b0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000001',2026,12,1,11,0),
('b0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000002',2026,10,0,10,0),
('b0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000003',2026,15,0,15,0),
('c0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000001',2026,12,3,9,0),
('c0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000002',2026,10,1,9,0),
('c0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000003',2026,15,0,15,0),
('c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000001',2026,12,0,12,0),
('c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000002',2026,10,2,8,0),
('c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000003',2026,15,0,15,0),
('c0000000-0000-0000-0000-000000000003','d0000000-0000-0000-0000-000000000001',2026,12,0,12,0),
('c0000000-0000-0000-0000-000000000003','d0000000-0000-0000-0000-000000000002',2026,10,0,10,0),
('c0000000-0000-0000-0000-000000000003','d0000000-0000-0000-0000-000000000003',2026,15,5,10,0),
('c0000000-0000-0000-0000-000000000004','d0000000-0000-0000-0000-000000000001',2026,12,0,12,0),
('c0000000-0000-0000-0000-000000000004','d0000000-0000-0000-0000-000000000002',2026,10,0,10,0),
('c0000000-0000-0000-0000-000000000004','d0000000-0000-0000-0000-000000000003',2026,15,0,15,0),
('c0000000-0000-0000-0000-000000000005','d0000000-0000-0000-0000-000000000001',2026,12,0,12,0),
('c0000000-0000-0000-0000-000000000005','d0000000-0000-0000-0000-000000000002',2026,10,0,10,0),
('c0000000-0000-0000-0000-000000000005','d0000000-0000-0000-0000-000000000003',2026,15,0,15,0);

-- SAMPLE LEAVES
INSERT INTO leaves (user_id, leave_type_id, from_date, to_date, total_days, reason, status, decided_by, decided_at, decision_remark) VALUES
('c0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000001','2026-02-09','2026-02-11',3,'Family function','approved','b0000000-0000-0000-0000-000000000001','2026-02-05','Approved. Enjoy!'),
('c0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000002','2026-03-20','2026-03-20',1,'Fever and cold','approved','b0000000-0000-0000-0000-000000000001','2026-03-20','Get well soon!'),
('c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000002','2026-04-06','2026-04-07',2,'Dental surgery','approved','b0000000-0000-0000-0000-000000000001','2026-04-04','Take care!');

INSERT INTO leaves (user_id, leave_type_id, from_date, to_date, total_days, reason, status) VALUES
('c0000000-0000-0000-0000-000000000003','d0000000-0000-0000-0000-000000000001','2026-06-01','2026-06-03',3,'Vacation trip to Goa','pending');
