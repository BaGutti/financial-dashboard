-- Add first_payment_date column to personal_credits table
ALTER TABLE personal_credits 
ADD COLUMN first_payment_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Update existing records to use start_date as first_payment_date
UPDATE personal_credits 
SET first_payment_date = start_date::DATE 
WHERE first_payment_date = CURRENT_DATE;

-- Add comment to clarify the difference between start_date and first_payment_date
COMMENT ON COLUMN personal_credits.start_date IS 'Date when the credit was taken/started';
COMMENT ON COLUMN personal_credits.first_payment_date IS 'Date when the first payment is due (might be different from start_date)';