-- Add table_id to pos_orders for direct table linking
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES restaurant_tables(id);

-- Create table sessions for tracking occupancy and revenue
CREATE TABLE IF NOT EXISTS table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  table_id UUID NOT NULL REFERENCES restaurant_tables(id),
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for table_sessions
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for table_sessions
CREATE POLICY "Restaurant owners can manage their table sessions"
ON table_sessions FOR ALL
USING (tenant_id = get_user_tenant());

CREATE POLICY "Super admins can view all table sessions"
ON table_sessions FOR SELECT
USING (is_super_admin());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_table_sessions_tenant_id ON table_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_table_sessions_table_id ON table_sessions(table_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_table_id ON pos_orders(table_id);

-- Add updated_at trigger for table_sessions
CREATE TRIGGER update_table_sessions_updated_at
BEFORE UPDATE ON table_sessions
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Enable realtime for table_sessions
ALTER TABLE table_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE table_sessions;