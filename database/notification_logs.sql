-- ============================================
-- Notification Logs Table (Email Tracking)
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS notification_logs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_id            UUID REFERENCES leaves(id) ON DELETE SET NULL,
    notification_type   VARCHAR(50) NOT NULL,
    email_to            VARCHAR(255) NOT NULL,
    email_status        VARCHAR(20) NOT NULL DEFAULT 'pending',
    error_message       TEXT,
    sent_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_user ON notification_logs(user_id);
CREATE INDEX idx_notification_leave ON notification_logs(leave_id);
CREATE INDEX idx_notification_type ON notification_logs(notification_type);
