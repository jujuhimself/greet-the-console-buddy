-- Create branches table for franchise/multi-branch management
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  phone text,
  manager_id uuid REFERENCES profiles(id),
  type text CHECK (type IN ('retail', 'wholesale')) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by parent
CREATE INDEX IF NOT EXISTS idx_branches_parent_id ON branches(parent_id);
-- Index for fast lookup by manager
CREATE INDEX IF NOT EXISTS idx_branches_manager_id ON branches(manager_id); 