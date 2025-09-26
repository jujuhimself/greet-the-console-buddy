-- Add wholesaler_id and retailer_id columns to audit_logs
ALTER TABLE audit_logs
  ADD COLUMN wholesaler_id UUID NULL,
  ADD COLUMN retailer_id UUID NULL;

-- (Optional) You may want to backfill these columns for existing logs if you can map user_id to wholesaler/retailer
-- UPDATE audit_logs SET wholesaler_id = ... WHERE ...;
-- UPDATE audit_logs SET retailer_id = ... WHERE ...; 