-- Create function to log menu views for analytics
CREATE OR REPLACE FUNCTION log_menu_view(tenant_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO menu_views (tenant_id, viewed_at)
  VALUES (tenant_id_param, NOW());
END;
$$;

-- Create table for menu views if it doesn't exist
CREATE TABLE IF NOT EXISTS menu_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_menu_views_tenant_viewed ON menu_views(tenant_id, viewed_at);

-- Enable RLS on menu_views table
ALTER TABLE menu_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for menu views
CREATE POLICY "Anyone can log menu views" ON menu_views
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their tenant's menu views" ON menu_views
FOR SELECT 
USING (
  tenant_id IN (
    SELECT t.id 
    FROM tenants t 
    INNER JOIN tenant_users tu ON t.id = tu.tenant_id 
    WHERE tu.user_id = auth.uid()
  )
);