-- Migration script to update furniture table from boolean fields to status enum

-- Add the new status column with default value
ALTER TABLE furniture ADD COLUMN status VARCHAR(50) DEFAULT 'PENDING_APPROVAL';

-- Migrate existing data based on old boolean values
-- Logic:
-- verified=true AND onRent=false -> AVAILABLE
-- verified=true AND onRent=true -> RENTED
-- verified=false -> PENDING_APPROVAL
UPDATE furniture 
SET status = CASE 
    WHEN is_verified = true AND is_on_rent = false THEN 'AVAILABLE'
    WHEN is_verified = true AND is_on_rent = true THEN 'RENTED'
    WHEN is_verified = false THEN 'PENDING_APPROVAL'
    ELSE 'PENDING_APPROVAL'
END;

-- Make the status column NOT NULL after migration
ALTER TABLE furniture MODIFY COLUMN status VARCHAR(50) NOT NULL;

-- Remove old boolean columns
ALTER TABLE furniture DROP COLUMN is_verified;
ALTER TABLE furniture DROP COLUMN is_on_rent;

-- Add index on status for better query performance
CREATE INDEX idx_furniture_status ON furniture(status);
CREATE INDEX idx_furniture_owner_status ON furniture(owner_id, status);
