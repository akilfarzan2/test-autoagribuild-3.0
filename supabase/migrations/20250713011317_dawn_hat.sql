/*
  # Add updated_at column to customer_db table

  1. Changes
    - Add `updated_at` column to `customer_db` table
    - Set default value to current timestamp
    - Add trigger to automatically update the timestamp on row updates

  2. Security
    - No RLS changes needed as this is just adding a timestamp column
*/

-- Add updated_at column to customer_db table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customer_db' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE customer_db ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create trigger to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_customer_db_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_customer_db_updated_at_trigger ON customer_db;
CREATE TRIGGER update_customer_db_updated_at_trigger
  BEFORE UPDATE ON customer_db
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_db_updated_at();