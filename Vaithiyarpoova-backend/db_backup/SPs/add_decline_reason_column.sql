-- Add decline_reason column to expenses table
ALTER TABLE expenses ADD COLUMN decline_reason TEXT NULL AFTER status;
