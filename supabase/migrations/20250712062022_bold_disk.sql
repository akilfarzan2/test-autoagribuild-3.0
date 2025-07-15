/*
  # Add grand_total column to job_cards table

  1. Changes
    - Add `grand_total` column to `job_cards` table
    - Set default value to 0.00
    - Use numeric(10,2) type for currency values

  2. Security
    - No RLS changes needed as this is just adding a column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_cards' AND column_name = 'grand_total'
  ) THEN
    ALTER TABLE job_cards ADD COLUMN grand_total numeric(10,2) DEFAULT 0.00;
  END IF;
END $$;