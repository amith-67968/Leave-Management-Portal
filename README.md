# LeavePort — Leave Management Portal

A full-stack, role-based Leave Management Portal for managing leave requests, approvals, leave balances, holidays, and salary deduction workflows.

## Live Deployment

- **Frontend / Vercel Project**: https://vercel.com/amiths-projects-c2d6cd4c/leave-management-portal
- **Backend / Render API**: https://leave-management-portal-3abq.onrender.com
- **API Health Check**: https://leave-management-portal-3abq.onrender.com/api/health
- **API Docs**: https://leave-management-portal-3abq.onrender.com/api-docs

> Note: the Vercel link above is the project/dashboard link. If you want the public app URL in the README, replace it with the deployed `.vercel.app` URL from Vercel.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite |
| Backend | Node.js + Express.js |
| Database | PostgreSQL via Supabase |
| Auth | JWT |
| API Docs | Swagger UI |

## Project Structure

```txt
backend/     Node.js + Express REST API
frontend/    React + Vite SPA
database/    SQL schema, seed data, and setup guide
README.md
```

## Quick Start

### 1. Database Setup

1. Create a Supabase project.
2. Run `database/schema.sql` in the Supabase SQL Editor.
3. Run the backend seed script to create demo users and hashed passwords.

### 2. Backend Setup

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend runs locally on:

```txt
http://localhost:5000
```

Required backend environment variables:

```env
DATABASE_URL=your_supabase_postgres_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
SMTP_FROM=LeavePort <noreply@leaveport.com>
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs locally on:

```txt
http://localhost:5173
```

Required frontend environment variable:

```env
VITE_API_URL=http://localhost:5000/api
```

For deployed Vercel frontend:

```env
VITE_API_URL=https://leave-management-portal-3abq.onrender.com/api
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| Manager | rahul.sharma@company.com | manager123 |
| Manager | priya.patel@company.com | manager123 |
| Employee | amit.kumar@company.com | employee123 |
| Employee | sneha.reddy@company.com | employee123 |

## Features

### Employee

- Apply for leave with working-day calculations.
- View leave balances.
- Track leave status.
- Cancel pending or approved leaves.
- View salary deductions.
- Access holiday calendar.

### Manager

- View and manage team leave requests.
- Approve or reject leaves with remarks.
- Monitor team availability.
- Enforce manager hierarchy.
- Prevent self-approval.

### Admin

- Manage users and assign managers.
- Configure leave types and quotas.
- Add or remove company holidays.
- View organization-wide leave history.
- Generate payroll deduction reports.
- View organization statistics.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/auth/accounts/:role` | Demo login accounts |
| POST | `/api/leaves` | Apply leave |
| GET | `/api/leaves/my` | My leaves |
| GET | `/api/leaves/team` | Team leaves |
| PATCH | `/api/leaves/:id/approve` | Approve leave |
| PATCH | `/api/leaves/:id/reject` | Reject leave |
| DELETE | `/api/leaves/:id` | Cancel leave |
| GET | `/api/leaves/balance` | Leave balance |
| GET | `/api/leaves/salary-summary` | Salary deductions |
| GET | `/api/holidays` | Company holidays |
| POST | `/api/holidays/admin` | Add holiday |
| GET | `/api/admin/leave-types` | Leave types |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/payroll` | Payroll report |
| GET | `/api/admin/leaves` | All leaves |
| GET | `/api/admin/stats` | Organization stats |

## Deployment Notes

### Render Backend

```txt
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Set these Render environment variables:

```env
DATABASE_URL=your_supabase_postgres_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-vercel-app.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
SMTP_FROM=LeavePort <noreply@leaveport.com>
```

### Vercel Frontend

```txt
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Set this Vercel environment variable:

```env
VITE_API_URL=https://leave-management-portal-3abq.onrender.com/api
```

## Business Rules

- Working days exclude weekends and holidays.
- Overlapping leave requests are blocked.
- Only assigned managers can approve or reject requests.
- Rejection requires a remark.
- Leave balance is deducted on approval and restored on cancellation.
- Salary deduction is calculated for Loss of Pay leave.
