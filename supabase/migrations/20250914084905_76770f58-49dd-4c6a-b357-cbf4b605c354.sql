-- Fix remaining functions with search_path issues

-- Fix update_order_history_updated_at function
CREATE OR REPLACE FUNCTION public.update_order_history_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix log_whatsapp_click function
CREATE OR REPLACE FUNCTION public.log_whatsapp_click(tenant_id_param uuid, cart_total_param numeric, items_count_param integer, order_type_param text, cart_id_param text, customer_phone_param text DEFAULT NULL::text, customer_name_param text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.whatsapp_clicks (
    tenant_id, cart_total, items_count, order_type, 
    cart_id, customer_phone, customer_name
  )
  VALUES (
    tenant_id_param, cart_total_param, items_count_param, 
    order_type_param, cart_id_param, customer_phone_param, customer_name_param
  );
END;
$$;

-- Fix validate_sensitive_data function
CREATE OR REPLACE FUNCTION public.validate_sensitive_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix get_popular_menu_items function
CREATE OR REPLACE FUNCTION public.get_popular_menu_items(tenant_id_param uuid, limit_param integer)
RETURNS TABLE(menu_item_id uuid, name text, total_orders bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    oi.menu_item_id,
    mi.name,
    SUM(oi.quantity) AS total_orders
  FROM public.order_items oi
  JOIN public.menu_items mi ON oi.menu_item_id = mi.id
  WHERE oi.tenant_id = tenant_id_param
  GROUP BY oi.menu_item_id, mi.name
  ORDER BY total_orders DESC
  LIMIT limit_param;
END;
$$;

-- Fix log_order_items function
CREATE OR REPLACE FUNCTION public.log_order_items(tenant_id_param uuid, items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    INSERT INTO public.order_items (tenant_id, menu_item_id, quantity)
    VALUES (tenant_id_param, (item->>'id')::UUID, (item->>'quantity')::INT);
  END LOOP;
END;
$$;

-- Fix log_menu_view function
CREATE OR REPLACE FUNCTION public.log_menu_view(tenant_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.menu_views (tenant_id, viewed_at)
  VALUES (tenant_id_param, NOW());
END;
$$;

-- Fix get_public_menu_data function
CREATE OR REPLACE FUNCTION public.get_public_menu_data(p_slug text)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant RECORD;
  v_categories JSON;
  v_menu_items JSON;
BEGIN
  -- Get the tenant details
  SELECT * INTO v_tenant
  FROM public.tenants
  WHERE slug = p_slug;

  -- If no tenant is found, return null
  IF v_tenant IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get categories for the tenant
  SELECT json_agg(
    json_build_object(
      'id', mc.id,
      'name', mc.name,
      'display_order', mc.display_order
    ) ORDER BY mc.display_order
  ) INTO v_categories
  FROM public.menu_categories mc
  WHERE mc.tenant_id = v_tenant.id AND mc.is_active = true;

  -- Get menu items for the tenant
  SELECT json_agg(
    json_build_object(
      'id', mi.id,
      'name', mi.name,
      'description', mi.description,
      'price', mi.price,
      'image_url', mi.image_url,
      'category_id', mi.category_id,
      'is_available', mi.is_available
    ) ORDER BY mi.display_order
  ) INTO v_menu_items
  FROM public.menu_items mi
  WHERE mi.tenant_id = v_tenant.id;

  -- Combine all data into a single JSON object
  RETURN json_build_object(
    'tenant', row_to_json(v_tenant),
    'categories', COALESCE(v_categories, '[]'::json),
    'menu_items', COALESCE(v_menu_items, '[]'::json)
  );
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'restaurant_owner')
  );
  RETURN NEW;
END;
$$;

-- Fix get_total_menu_views function
CREATE OR REPLACE FUNCTION public.get_total_menu_views(tenant_id_param uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_views BIGINT;
BEGIN
  SELECT COUNT(*)
  INTO total_views
  FROM public.menu_views
  WHERE tenant_id = tenant_id_param;

  RETURN total_views;
END;
$$;

-- Fix get_sales_data function
CREATE OR REPLACE FUNCTION public.get_sales_data(tenant_id_param uuid, time_period_param text)
RETURNS TABLE(date_trunc text, total_sales numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(date_trunc(time_period_param, o.created_at), 'YYYY-MM-DD') AS date_trunc,
    SUM(o.total_price) AS total_sales
  FROM public.orders o
  WHERE o.tenant_id = tenant_id_param
  GROUP BY date_trunc(time_period_param, o.created_at)
  ORDER BY date_trunc(time_period_param, o.created_at);
END;
$$;

-- Fix get_new_tenants_over_time function
CREATE OR REPLACE FUNCTION public.get_new_tenants_over_time(time_period_param text)
RETURNS TABLE(date_trunc text, new_tenants_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(date_trunc(time_period_param, t.created_at), 'YYYY-MM-DD') AS date_trunc,
    COUNT(t.id) AS new_tenants_count
  FROM public.tenants t
  GROUP BY date_trunc(time_period_param, t.created_at)
  ORDER BY date_trunc(time_period_param, t.created_at);
END;
$$;

-- Fix submit_feedback function
CREATE OR REPLACE FUNCTION public.submit_feedback(tenant_id_param uuid, rating_param integer, comment_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.feedback (tenant_id, rating, comment)
  VALUES (tenant_id_param, rating_param, comment_param);
END;
$$;

-- Fix log_order function
CREATE OR REPLACE FUNCTION public.log_order(tenant_id_param uuid, total_price_param numeric, order_type_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.orders (tenant_id, total_price, order_type)
  VALUES (tenant_id_param, total_price_param, order_type_param);
END;
$$;