-- Run this in the Supabase SQL Editor if you already created the trades table
-- and need to add the commission column.

ALTER TABLE trades ADD COLUMN IF NOT EXISTS commission NUMERIC DEFAULT 0;
ALTER TABLE trades ALTER COLUMN emotion DROP NOT NULL;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_emotion_check;
