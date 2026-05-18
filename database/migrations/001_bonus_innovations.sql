-- Bonus innovations migration:
-- half-day leave support, comp-off holiday work credits, and carry-forward support.

ALTER TABLE leaves
  ADD COLUMN IF NOT EXISTS day_part VARCHAR(20) NOT NULL DEFAULT 'full';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_leave_day_part'
  ) THEN
    ALTER TABLE leaves
      ADD CONSTRAINT chk_leave_day_part
      CHECK (day_part IN ('full', 'first_half', 'second_half'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS holiday_work_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  holiday_id UUID REFERENCES holidays(id) ON DELETE SET NULL,
  work_date DATE NOT NULL,
  credited_leave_type_id UUID REFERENCES leave_types(id) ON DELETE SET NULL,
  credited_days NUMERIC(5, 1) NOT NULL DEFAULT 1,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_holiday_work_credit UNIQUE (user_id, work_date)
);

CREATE INDEX IF NOT EXISTS idx_holiday_work_user ON holiday_work_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_holiday_work_date ON holiday_work_logs(work_date);

INSERT INTO leave_types (name, annual_quota, carry_forward_max, is_paid, description)
VALUES ('Compensatory Off', 0, 5, TRUE, 'Auto-credited when an employee works on a company holiday')
ON CONFLICT (name) DO NOTHING;
