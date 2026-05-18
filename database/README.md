# Database Setup — Supabase (PostgreSQL)

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up / log in
2. Click **"New Project"**
3. Choose your organization, give it a name (e.g., `leave-portal`), set a database password, and select a region
4. Wait for the project to be provisioned (~2 minutes)

## 2. Get Connection Details

1. In your Supabase dashboard, go to **Settings → Database**
2. Under **Connection string → URI**, copy the connection string
3. It looks like: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
4. Replace `[password]` with the password you set during project creation

## 3. Run the Schema

### Option A: Supabase SQL Editor (Recommended)
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Paste the contents of `schema.sql` and click **Run**
4. Then paste the contents of `seed.sql` and click **Run**

### Option B: Command Line (psql)
```bash
psql "YOUR_CONNECTION_STRING" -f schema.sql
psql "YOUR_CONNECTION_STRING" -f seed.sql
```

### Option C: Backend Seeder (Best for passwords)
```bash
cd ../backend
npm run seed
```
This will hash passwords properly with bcrypt before inserting.

## 4. Configure the Backend

Create a `.env` file in the `backend/` folder:

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
JWT_SECRET=your-secret-key-min-32-chars-long
PORT=5000
```

## 5. Verify Setup

After running the schema and seed, verify tables exist:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Expected tables: `users`, `leave_types`, `leave_balances`, `leaves`, `holidays`, `payroll_logs`

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| Manager | rahul.sharma@company.com | manager123 |
| Manager | priya.patel@company.com | manager123 |
| Employee | amit.kumar@company.com | employee123 |
| Employee | sneha.reddy@company.com | employee123 |
| Employee | vikram.singh@company.com | employee123 |
| Employee | neha.gupta@company.com | employee123 |
| Employee | arjun.das@company.com | employee123 |
