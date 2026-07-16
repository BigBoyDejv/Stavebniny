-- SQL migration to add quantity column to rental_items
-- Run this script in your Supabase SQL Editor.

ALTER TABLE rental_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
