-- Migration: Add is_timed_out and completed_count columns to student_sessions
-- Tracks whether a session ended due to timer expiration and how many activities were completed.

ALTER TABLE student_sessions 
ADD COLUMN IF NOT EXISTS is_timed_out BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed_count INT DEFAULT 3;
