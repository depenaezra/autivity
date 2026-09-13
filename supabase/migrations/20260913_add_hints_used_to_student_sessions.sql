-- Migration: Add hints_used column to student_sessions
-- Tracks the total number of manual hint button requests in each session

ALTER TABLE student_sessions ADD COLUMN IF NOT EXISTS hints_used INT DEFAULT 0;
