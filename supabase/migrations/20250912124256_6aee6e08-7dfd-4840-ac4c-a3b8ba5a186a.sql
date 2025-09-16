-- Add approval tracking columns to pos_orders table
ALTER TABLE pos_orders ADD COLUMN approved_by UUID REFERENCES profiles(id);
ALTER TABLE pos_orders ADD COLUMN approved_at TIMESTAMPTZ;

-- Update default status for new orders to pending_approval
ALTER TABLE pos_orders ALTER COLUMN status SET DEFAULT 'pending_approval';