# LeavePort — Leave Management Portal

A full-stack, role-based Leave Management Portal built for organizations to streamline leave requests, approvals, balance tracking, holiday management, and salary deduction workflows.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (via Supabase) |
| Auth | JWT (JSON Web Tokens) |
| API Docs | Swagger UI |

## 📁 Project Structure

```
├── backend/          # Node.js + Express REST API
├── frontend/         # React + Vite SPA
├── database/         # SQL schema, seed data, setup guide
└── README.md
```

## 🚀 Quick Start

### 1. Database Setup

1. Create a free Supabase project at [supabase.com](https://supabase.com)
2. Run `database/schema.sql` in the Supabase SQL Editor
3. See `database/README.md` for detailed instructions

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
npm install
npm run seed    # Seeds demo data with hashed passwords
npm run dev     # Starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Starts on http://localhost:5173
```

### 4. Open the App

- **App**: http://localhost:5173
- **API Docs**: http://localhost:5000/api-docs

## 👥 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| Manager | rahul.sharma@company.com | manager123 |
| Manager | priya.patel@company.com | manager123 |
| Employee | amit.kumar@company.com | employee123 |
| Employee | sneha.reddy@company.com | employee123 |

## 🎯 Features

### Employee
- Apply for leave with working-day calculations
- View leave balances (visual progress rings)
- Track leave status (Pending / Approved / Rejected / Cancelled)
- Cancel pending or approved leaves
- View salary deductions (LOP)
- Access holiday calendar

### Manager
- View and manage team leave requests
- Approve or reject leaves with remarks
- Monitor team availability
- Manager hierarchy enforcement
- Self-approval prevention

### Admin
- Manage users and assign managers
- Configure leave types and quotas
- Add/remove company holidays
- View complete org-wide leave history
- Payroll deduction reports
- Organization statistics dashboard

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| POST | /api/leaves | Apply leave |
| GET | /api/leaves/my | My leaves |
| GET | /api/leaves/team | Team leaves |
| PATCH | /api/leaves/:id/approve | Approve |
| PATCH | /api/leaves/:id/reject | Reject |
| DELETE | /api/leaves/:id | Cancel |
| GET | /api/leaves/balance | My balance |
| GET | /api/leaves/salary-summary | Salary deductions |
| GET | /api/holidays | Company holidays |
| POST | /api/holidays/admin | Add holiday |
| GET | /api/admin/leave-types | Leave types |
| GET | /api/admin/users | All users |
| GET | /api/admin/payroll | Payroll report |
| GET | /api/admin/leaves | All leaves |
| GET | /api/admin/stats | Org stats |

Full API docs with Swagger UI at `/api-docs`.

## 💰 Salary Deduction Logic

When paid leave balance is exceeded:
- Extra days become **Loss of Pay (LOP)**
- Deduction = `(Monthly Salary / 30) × LOP Days`
- Automatically calculated upon leave approval
- Tracked in `payroll_logs` table

## 🔐 Business Rules

- Working days exclude weekends and holidays
- Overlapping leave requests are blocked
- Only assigned managers can approve/reject
- Rejection requires a mandatory remark
- Balance is deducted on approval, restored on cancellation
- Manager hierarchy strictly enforced
