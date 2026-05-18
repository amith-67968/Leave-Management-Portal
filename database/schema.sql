-- ============================================
-- Leave Management Portal — Database Schema
-- PostgreSQL (Supabase compatible)
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('employee', 'manager', 'admin');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    manager_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    role            user_role NOT NULL DEFAULT 'employee',
    joining_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    monthly_salary  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- LEAVE TYPES TABLE
-- ============================================

CREATE TABLE leave_types (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(50) UNIQUE NOT NULL,
    annual_quota        INTEGER NOT NULL DEFAULT 0,
    carry_forward_max   INTEGER NOT NULL DEFAULT 0,
    is_paid             BOOLEAN NOT NULL DEFAULT TRUE,
    description         TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- LEAVE BALANCES TABLE
-- ============================================

CREATE TABLE leave_balances (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type_id   UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    year            INTEGER NOT NULL,
    allocated       NUMERIC(5, 1) NOT NULL DEFAULT 0,
    used            NUMERIC(5, 1) NOT NULL DEFAULT 0,
    remaining       NUMERIC(5, 1) NOT NULL DEFAULT 0,
    carried_forward NUMERIC(5, 1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_leave_balance UNIQUE (user_id, leave_type_id, year),
    CONSTRAINT chk_remaining CHECK (remaining >= 0 OR remaining = remaining),
    CONSTRAINT chk_used CHECK (used >= 0)
);

CREATE INDEX idx_leave_balances_user ON leave_balances(user_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);

-- ============================================
-- LEAVES TABLE
-- ============================================

CREATE TABLE leaves (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type_id   UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    from_date       DATE NOT NULL,
    to_date         DATE NOT NULL,
    total_days      NUMERIC(5, 1) NOT NULL,
    reason          TEXT NOT NULL,
    status          leave_status NOT NULL DEFAULT 'pending',
    applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    decided_at      TIMESTAMPTZ,
    decision_remark TEXT,

    CONSTRAINT chk_date_range CHECK (to_date >= from_date),
    CONSTRAINT chk_total_days CHECK (total_days > 0)
);

CREATE INDEX idx_leaves_user ON leaves(user_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_dates ON leaves(from_date, to_date);
CREATE INDEX idx_leaves_decided_by ON leaves(decided_by);

-- ============================================
-- HOLIDAYS TABLE
-- ============================================

CREATE TABLE holidays (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date        DATE UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    is_optional BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_holidays_year ON holidays(EXTRACT(YEAR FROM date));

-- ============================================
-- PAYROLL LOGS TABLE (Bonus)
-- ============================================

CREATE TABLE payroll_logs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month               INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year                INTEGER NOT NULL,
    lop_days            NUMERIC(5, 1) NOT NULL DEFAULT 0,
    deduction_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
    final_salary        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_payroll UNIQUE (user_id, month, year)
);

CREATE INDEX idx_payroll_user ON payroll_logs(user_id);
CREATE INDEX idx_payroll_period ON payroll_logs(year, month);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_leave_balances_updated_at
    BEFORE UPDATE ON leave_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
