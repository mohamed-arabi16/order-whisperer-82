-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION log_menu_view(tenant_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO menu_views (tenant_id, viewed_at)
  VALUES (tenant_id_param, NOW());
END;
$$;