-- Fix critical security issues: Update RLS policies to require authentication for sensitive data

-- 1. Update whatsapp_clicks table to require authentication for viewing customer data
DROP POLICY IF EXISTS "Public can insert WhatsApp clicks" ON whatsapp_clicks;
DROP POLICY IF EXISTS "Restaurant owners can view their WhatsApp clicks" ON whatsapp_clicks;
DROP POLICY IF EXISTS "Super admins can view all WhatsApp clicks" ON whatsapp_clicks;

-- Allow anonymous users to log clicks but restrict viewing to authenticated users only
CREATE POLICY "Anonymous can insert WhatsApp clicks" 
ON whatsapp_clicks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Restaurant owners can view their WhatsApp clicks" 
ON whatsapp_clicks 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  tenant_id IN (
    SELECT t.id
    FROM tenants t
    JOIN profiles p ON t.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Super admins can view all WhatsApp clicks" 
ON whatsapp_clicks 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_super_admin());

-- 2. Update order_history table to protect customer personal data
DROP POLICY IF EXISTS "Public can insert order history" ON order_history;
DROP POLICY IF EXISTS "Restaurant owners can view their order history" ON order_history;
DROP POLICY IF EXISTS "Super admins can view all order history" ON order_history;

-- Allow anonymous users to log orders but restrict viewing to authenticated users
CREATE POLICY "Anonymous can insert order history" 
ON order_history 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Restaurant owners can view their order history" 
ON order_history 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  tenant_id IN (
    SELECT t.id
    FROM tenants t
    JOIN profiles p ON t.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Super admins can view all order history" 
ON order_history 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_super_admin());

-- 3. Update contact_messages to require authentication for viewing
DROP POLICY IF EXISTS "Public can insert contact messages." ON contact_messages;

CREATE POLICY "Public can insert contact messages" 
ON contact_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Super admins can view all contact messages" 
ON contact_messages 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_super_admin());

-- 4. Fix database function security paths - Update all functions to include SET search_path = public
CREATE OR REPLACE FUNCTION public.log_whatsapp_click(
  tenant_id_param uuid, 
  cart_total_param numeric, 
  items_count_param integer, 
  order_type_param text, 
  cart_id_param text, 
  customer_phone_param text DEFAULT NULL, 
  customer_name_param text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO whatsapp_clicks (
    tenant_id, cart_total, items_count, order_type, 
    cart_id, customer_phone, customer_name
  )
  VALUES (
    tenant_id_param, cart_total_param, items_count_param, 
    order_type_param, cart_id_param, customer_phone_param, customer_name_param
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_menu_view(tenant_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO menu_views (tenant_id)
  VALUES (tenant_id_param);
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_order_items(tenant_id_param uuid, items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    INSERT INTO order_items (tenant_id, menu_item_id, quantity)
    VALUES (tenant_id_param, (item->>'id')::UUID, (item->>'quantity')::INT);
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_feedback(
  tenant_id_param uuid, 
  rating_param integer, 
  comment_param text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO feedback (tenant_id, rating, comment)
  VALUES (tenant_id_param, rating_param, comment_param);
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_order(
  tenant_id_param uuid, 
  total_price_param numeric, 
  order_type_param text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO orders (tenant_id, total_price, order_type)
  VALUES (tenant_id_param, total_price_param, order_type_param);
END;
$function$;

-- 5. Prevent users from updating their own roles
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile" 
ON profiles 
FOR UPDATE 
USING (
  (user_id = auth.uid() AND role = (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1)) 
  OR is_super_admin()
);

-- 6. Add input validation trigger for sensitive data
CREATE OR REPLACE FUNCTION public.validate_sensitive_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Validate phone numbers (basic validation)
  IF NEW.customer_phone IS NOT NULL AND NOT NEW.customer_phone ~ '^\+?[1-9]\d{1,14}$' THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;
  
  -- Validate names (prevent script injection)
  IF NEW.customer_name IS NOT NULL AND NEW.customer_name ~ '[<>\"''&]' THEN
    RAISE EXCEPTION 'Invalid characters in customer name';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Apply validation trigger to sensitive tables
DROP TRIGGER IF EXISTS validate_whatsapp_clicks ON whatsapp_clicks;
CREATE TRIGGER validate_whatsapp_clicks
  BEFORE INSERT OR UPDATE ON whatsapp_clicks
  FOR EACH ROW EXECUTE FUNCTION validate_sensitive_data();

DROP TRIGGER IF EXISTS validate_order_history ON order_history;
CREATE TRIGGER validate_order_history
  BEFORE INSERT OR UPDATE ON order_history
  FOR EACH ROW EXECUTE FUNCTION validate_sensitive_data();