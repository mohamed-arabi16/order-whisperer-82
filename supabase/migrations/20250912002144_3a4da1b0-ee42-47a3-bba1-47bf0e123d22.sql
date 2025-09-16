-- Enhanced POS System Database Migration

-- Create restaurant tables for table management
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  table_number VARCHAR(10) NOT NULL,
  capacity INTEGER DEFAULT 4,
  location_area VARCHAR(50),
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, table_number)
);

-- Create POS analytics table
CREATE TABLE IF NOT EXISTS public.pos_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  date DATE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  avg_preparation_time INTERVAL,
  peak_hours JSONB DEFAULT '{}',
  staff_performance JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, date)
);

-- Create staff performance tracking
CREATE TABLE IF NOT EXISTS public.staff_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  staff_id UUID NOT NULL,
  shift_date DATE NOT NULL,
  orders_completed INTEGER DEFAULT 0,
  avg_completion_time INTERVAL,
  performance_score NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, staff_id, shift_date)
);

-- Create notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  new_order_sound BOOLEAN DEFAULT true,
  urgent_order_alert BOOLEAN DEFAULT true,
  browser_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  sms_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Add priority and table assignment to pos_orders
ALTER TABLE public.pos_orders 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES public.restaurant_tables(id),
ADD COLUMN IF NOT EXISTS estimated_completion_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assigned_staff_id UUID,
ADD COLUMN IF NOT EXISTS preparation_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ready_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completion_time TIMESTAMP WITH TIME ZONE;

-- Enable RLS for new tables
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_analytics ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.staff_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for restaurant_tables
CREATE POLICY "Restaurant owners can manage their tables" ON public.restaurant_tables
FOR ALL USING (tenant_id = get_user_tenant());

CREATE POLICY "Super admins can view all tables" ON public.restaurant_tables
FOR SELECT USING (is_super_admin());

-- RLS policies for pos_analytics
CREATE POLICY "Restaurant owners can view their analytics" ON public.pos_analytics
FOR SELECT USING (tenant_id = get_user_tenant());

CREATE POLICY "Restaurant owners can manage their analytics" ON public.pos_analytics
FOR ALL USING (tenant_id = get_user_tenant());

CREATE POLICY "Super admins can view all analytics" ON public.pos_analytics
FOR SELECT USING (is_super_admin());

-- RLS policies for staff_performance
CREATE POLICY "Restaurant owners can view their staff performance" ON public.staff_performance
FOR SELECT USING (tenant_id = get_user_tenant());

CREATE POLICY "Restaurant owners can manage staff performance" ON public.staff_performance
FOR ALL USING (tenant_id = get_user_tenant());

CREATE POLICY "Super admins can view all staff performance" ON public.staff_performance
FOR SELECT USING (is_super_admin());

-- RLS policies for notification_preferences
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Restaurant owners can view their tenant notifications" ON public.notification_preferences
FOR SELECT USING (tenant_id = get_user_tenant());

CREATE POLICY "Super admins can view all notifications" ON public.notification_preferences
FOR SELECT USING (is_super_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_tenant_id ON public.restaurant_tables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pos_analytics_tenant_date ON public.pos_analytics(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_staff_performance_tenant_staff ON public.staff_performance(tenant_id, staff_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_pos_orders_priority_status ON public.pos_orders(priority, status);
CREATE INDEX IF NOT EXISTS idx_pos_orders_table_id ON public.pos_orders(table_id) WHERE table_id IS NOT NULL;

-- Create triggers for updated_at columns
CREATE TRIGGER update_restaurant_tables_updated_at
BEFORE UPDATE ON public.restaurant_tables
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pos_analytics_updated_at  
BEFORE UPDATE ON public.pos_analytics
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_staff_performance_updated_at
BEFORE UPDATE ON public.staff_performance  
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_performance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_preferences;