-- Create order history table for tracking completed orders
CREATE TABLE public.order_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  cart_id TEXT NOT NULL,
  cart_hash TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  order_type TEXT NOT NULL DEFAULT 'whatsapp',
  order_mode TEXT NOT NULL DEFAULT 'dine_in',
  items_count INTEGER NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  order_data JSONB,
  customer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Restaurant owners can view their order history" 
ON public.order_history 
FOR SELECT 
USING (tenant_id IN (
  SELECT t.id 
  FROM tenants t 
  JOIN profiles p ON (t.owner_id = p.id) 
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Super admins can view all order history" 
ON public.order_history 
FOR SELECT 
USING (is_super_admin());

CREATE POLICY "Public can insert order history" 
ON public.order_history 
FOR INSERT 
WITH CHECK (true);

-- Create function for updated_at
CREATE OR REPLACE FUNCTION update_order_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_order_history_updated_at
  BEFORE UPDATE ON public.order_history
  FOR EACH ROW
  EXECUTE FUNCTION update_order_history_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_order_history_tenant_id ON public.order_history(tenant_id);
CREATE INDEX idx_order_history_created_at ON public.order_history(created_at);
CREATE INDEX idx_order_history_cart_hash ON public.order_history(cart_hash);