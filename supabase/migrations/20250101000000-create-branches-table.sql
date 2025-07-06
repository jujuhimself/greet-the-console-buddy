-- Create branches table for franchise/multi-branch management
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  phone text,
  manager_id uuid REFERENCES profiles(id),
  type text CHECK (type IN ('retail', 'wholesale')) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- Index for fast lookup by parent
CREATE INDEX IF NOT EXISTS idx_branches_parent_id ON branches(parent_id);
-- Index for fast lookup by manager
CREATE INDEX IF NOT EXISTS idx_branches_manager_id ON branches(manager_id);

-- Add RLS policies
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see branches they own (as parent_id)
CREATE POLICY "Users can view their own branches" ON branches
  FOR SELECT USING (auth.uid() = parent_id);

-- Policy: Users can insert branches they own
CREATE POLICY "Users can insert their own branches" ON branches
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Policy: Users can update branches they own
CREATE POLICY "Users can update their own branches" ON branches
  FOR UPDATE USING (auth.uid() = parent_id);

-- Policy: Users can delete branches they own
CREATE POLICY "Users can delete their own branches" ON branches
  FOR DELETE USING (auth.uid() = parent_id); 