-- Add delivery fee and branch fields to tenants table
ALTER TABLE public.tenants 
ADD COLUMN delivery_fee INTEGER DEFAULT 0,
ADD COLUMN branch_name TEXT;

-- Create table for WhatsApp click analytics
CREATE TABLE public.whatsapp_clicks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id UUID NOT NULL,
  cart_total NUMERIC NOT NULL,
  items_count INTEGER NOT NULL,
  order_type TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  cart_id TEXT NOT NULL,
  customer_phone TEXT,
  customer_name TEXT
);

-- Enable RLS on whatsapp_clicks
ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;

-- Create policies for WhatsApp clicks
CREATE POLICY "Public can insert WhatsApp clicks" 
ON public.whatsapp_clicks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Restaurant owners can view their WhatsApp clicks" 
ON public.whatsapp_clicks 
FOR SELECT 
USING (tenant_id IN (
  SELECT t.id FROM tenants t
  JOIN profiles p ON t.owner_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Super admins can view all WhatsApp clicks" 
ON public.whatsapp_clicks 
FOR SELECT 
USING (is_super_admin());

-- Create table for order item notes/customizations
CREATE TABLE public.cart_item_notes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart_id TEXT NOT NULL,
  menu_item_id UUID NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on cart_item_notes
ALTER TABLE public.cart_item_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for cart item notes
CREATE POLICY "Public can insert cart item notes" 
ON public.cart_item_notes 
FOR INSERT 
WITH CHECK (true);

-- Create function to log WhatsApp clicks
CREATE OR REPLACE FUNCTION public.log_whatsapp_click(
  tenant_id_param UUID,
  cart_total_param NUMERIC,
  items_count_param INTEGER,
  order_type_param TEXT,
  cart_id_param TEXT,
  customer_phone_param TEXT DEFAULT NULL,
  customer_name_param TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;