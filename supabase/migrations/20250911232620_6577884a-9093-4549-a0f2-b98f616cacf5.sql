-- Drop the incorrect policy first if it exists
DROP POLICY IF EXISTS "Users can view their tenant's menu views" ON menu_views;

-- Create correct RLS policy for menu views using the correct table structure
CREATE POLICY "Users can view their tenant's menu views" ON menu_views
FOR SELECT 
USING (
  tenant_id IN (
    SELECT id FROM tenants WHERE owner_id = auth.uid()
  )
);