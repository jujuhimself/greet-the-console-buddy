-- Add test_id column to lab_results for linking to lab_tests
ALTER TABLE lab_results ADD COLUMN IF NOT EXISTS test_id uuid NULL;
-- Optionally, add a foreign key constraint if lab_tests.id is UUID
-- ALTER TABLE lab_results ADD CONSTRAINT fk_lab_results_test_id FOREIGN KEY (test_id) REFERENCES lab_tests(id); 