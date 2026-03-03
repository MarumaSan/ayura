-- Add is_preorder field to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_is_preorder ON orders(is_preorder);

-- Add comment
COMMENT ON COLUMN orders.is_preorder IS 'Flag to indicate if this is a pre-order for next delivery cycle';
