const DEMO_USERS = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'System Admin',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin',
    joining_date: '2020-01-01',
    monthly_salary: 100000,
    manager_id: null,
    manager_name: null,
    manager_email: null,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@company.com',
    password: 'manager123',
    role: 'manager',
    joining_date: '2021-03-15',
    monthly_salary: 90000,
    manager_id: null,
    manager_name: null,
    manager_email: null,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Priya Patel',
    email: 'priya.patel@company.com',
    password: 'manager123',
    role: 'manager',
    joining_date: '2021-06-01',
    monthly_salary: 85000,
    manager_id: null,
    manager_name: null,
    manager_email: null,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Amit Kumar',
    email: 'amit.kumar@company.com',
    password: 'employee123',
    role: 'employee',
    joining_date: '2022-01-10',
    monthly_salary: 60000,
    manager_id: 'b0000000-0000-0000-0000-000000000001',
    manager_name: 'Rahul Sharma',
    manager_email: 'rahul.sharma@company.com',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@company.com',
    password: 'employee123',
    role: 'employee',
    joining_date: '2022-04-20',
    monthly_salary: 55000,
    manager_id: 'b0000000-0000-0000-0000-000000000001',
    manager_name: 'Rahul Sharma',
    manager_email: 'rahul.sharma@company.com',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Vikram Singh',
    email: 'vikram.singh@company.com',
    password: 'employee123',
    role: 'employee',
    joining_date: '2023-02-01',
    monthly_salary: 58000,
    manager_id: 'b0000000-0000-0000-0000-000000000001',
    manager_name: 'Rahul Sharma',
    manager_email: 'rahul.sharma@company.com',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    name: 'Neha Gupta',
    email: 'neha.gupta@company.com',
    password: 'employee123',
    role: 'employee',
    joining_date: '2023-07-15',
    monthly_salary: 52000,
    manager_id: 'b0000000-0000-0000-0000-000000000002',
    manager_name: 'Priya Patel',
    manager_email: 'priya.patel@company.com',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    name: 'Arjun Das',
    email: 'arjun.das@company.com',
    password: 'employee123',
    role: 'employee',
    joining_date: '2024-01-08',
    monthly_salary: 50000,
    manager_id: 'b0000000-0000-0000-0000-000000000002',
    manager_name: 'Priya Patel',
    manager_email: 'priya.patel@company.com',
  },
];

const CONNECTION_ERROR_CODES = new Set([
  'ENOTFOUND',
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENETUNREACH',
]);

const isDemoAuthFallbackEnabled = () =>
  process.env.NODE_ENV !== 'production' &&
  process.env.DISABLE_DEMO_AUTH_FALLBACK !== 'true';

const isDatabaseConnectionError = (error) =>
  CONNECTION_ERROR_CODES.has(error?.code) ||
  CONNECTION_ERROR_CODES.has(error?.cause?.code);

const findDemoUserByEmail = (email) =>
  DEMO_USERS.find((user) => user.email === String(email || '').toLowerCase());

const findDemoUserById = (id) =>
  DEMO_USERS.find((user) => user.id === id);

const listDemoUsersByRole = (role) =>
  DEMO_USERS.filter((user) => user.role === role);

const toTokenUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const toProfileUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  joining_date: user.joining_date,
  monthly_salary: user.monthly_salary,
  manager_name: user.manager_name,
  manager_email: user.manager_email,
});

module.exports = {
  isDemoAuthFallbackEnabled,
  isDatabaseConnectionError,
  findDemoUserByEmail,
  findDemoUserById,
  listDemoUsersByRole,
  toTokenUser,
  toProfileUser,
};
