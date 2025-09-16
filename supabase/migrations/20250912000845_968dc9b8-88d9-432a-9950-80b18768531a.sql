-- Create POS Orders table for real-time order management
CREATE TABLE public.pos_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_number VARCHAR(50) NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'completed', 'cancelled')),
  order_type TEXT NOT NULL DEFAULT 'whatsapp',
  customer_info JSONB,
  items JSONB NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create POS Stations table for kitchen display management
CREATE TABLE public.pos_stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  station_name TEXT NOT NULL,
  station_type TEXT NOT NULL DEFAULT 'kitchen' CHECK (station_type IN ('kitchen', 'counter', 'mobile')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_heartbeat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for pos_orders
ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS for pos_stations  
ALTER TABLE public.pos_stations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pos_orders
CREATE POLICY "Restaurant owners can view their POS orders" 
ON public.pos_orders 
FOR SELECT 
USING (tenant_id = get_user_tenant());

CREATE POLICY "Restaurant owners can manage their POS orders" 
ON public.pos_orders 
FOR ALL 
USING (tenant_id = get_user_tenant());

CREATE POLICY "Anonymous can insert POS orders" 
ON public.pos_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Super admins can view all POS orders" 
ON public.pos_orders 
FOR SELECT 
USING (is_super_admin());

-- Create RLS policies for pos_stations
CREATE POLICY "Restaurant owners can view their POS stations" 
ON public.pos_stations 
FOR SELECT 
USING (tenant_id = get_user_tenant());

CREATE POLICY "Restaurant owners can manage their POS stations" 
ON public.pos_stations 
FOR ALL 
USING (tenant_id = get_user_tenant());

CREATE POLICY "Super admins can view all POS stations" 
ON public.pos_stations 
FOR SELECT 
USING (is_super_admin());

-- Create indexes for performance
CREATE INDEX idx_pos_orders_tenant_id ON public.pos_orders(tenant_id);
CREATE INDEX idx_pos_orders_status ON public.pos_orders(status);
CREATE INDEX idx_pos_orders_created_at ON public.pos_orders(created_at);
CREATE INDEX idx_pos_stations_tenant_id ON public.pos_stations(tenant_id);

-- Create triggers for updated_at
CREATE TRIGGER update_pos_orders_updated_at
BEFORE UPDATE ON public.pos_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_stations_updated_at
BEFORE UPDATE ON public.pos_stations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for pos_orders (for live order updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_orders;