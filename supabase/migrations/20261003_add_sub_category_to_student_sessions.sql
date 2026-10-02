-- Migration: Add sub_category column to student_sessions
-- Tracks the specific subcategory (e.g., 'Fruit & Veggie Counting', 'Matching Colors', etc.) for fine-grained adaptive progression and badges.

ALTER TABLE student_sessions 
ADD COLUMN IF NOT EXISTS sub_category TEXT;
