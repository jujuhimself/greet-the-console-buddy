ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES branches(id);
-- Optionally, migrate existing staff to have branch_id = NULL or set to a default branch if needed. 