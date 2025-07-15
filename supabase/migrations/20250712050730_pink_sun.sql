/*
  # Add total_hours column to job_cards table

  1. Changes
    - Add `total_hours` column to `job_cards` table
    - Column type: numeric(10,2) to store decimal hours
    - Default value: 0.00
    - Nullable: true to allow empty values

  2. Purpose
    - Track total hours spent on mechanic work for each job card
    - Used in the Mechanic Section of the job card form
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_cards' AND column_name = 'total_hours'
  ) THEN
    ALTER TABLE job_cards ADD COLUMN total_hours numeric(10,2) DEFAULT 0.00;
  END IF;
END $$;