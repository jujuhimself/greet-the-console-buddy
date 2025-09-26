-- Migration: Create quality_control_checks table for lab quality control records
CREATE TABLE IF NOT EXISTS quality_control_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_name text NOT NULL,
  check_type text NOT NULL CHECK (check_type IN ('daily', 'weekly', 'monthly', 'calibration')),
  status text NOT NULL CHECK (status IN ('passed', 'failed', 'pending')),
  checked_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  check_date date NOT NULL,
  next_check_date date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by equipment
CREATE INDEX IF NOT EXISTS idx_quality_control_equipment ON quality_control_checks (equipment_name); 