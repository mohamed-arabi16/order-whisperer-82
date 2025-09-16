-- POS System Expansion - Database Schema
-- Add staff users table for restaurant employees
CREATE TABLE public.staff_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cashier', -- 'cashier', 'waiter', 'kitchen', 'manager'
  pin_code TEXT, -- 4-digit PIN for quick login
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  order_id UUID NOT NULL,
  payment_method TEXT NOT NULL, -- 'cash', 'card', 'digital'
  amount NUMERIC NOT NULL,
  received_amount NUMERIC, -- for cash payments
  change_amount NUMERIC DEFAULT 0,
  processed_by UUID, -- staff_user_id
  payment_status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
  transaction_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add shifts table for staff shift management
CREATE TABLE public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  staff_user_id UUID NOT NULL,
  shift_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shift_end TIMESTAMP WITH TIME ZONE,
  opening_cash NUMERIC DEFAULT 0,
  closing_cash NUMERIC,
  total_sales NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  cash_payments NUMERIC DEFAULT 0,
  card_payments NUMERIC DEFAULT 0,
  discounts_given NUMERIC DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'closed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add POS devices table
CREATE TABLE public.pos_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL, -- 'pos_terminal', 'kitchen_display', 'receipt_printer'
  ip_address INET,
  mac_address TEXT,
  printer_config JSONB, -- printer settings for ESC/POS
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhance pos_orders table with missing fields
ALTER TABLE public.pos_orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS staff_user_id UUID,
ADD COLUMN IF NOT EXISTS shift_id UUID,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_charge NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'whatsapp', -- 'whatsapp', 'pos', 'qr'
ADD COLUMN IF NOT EXISTS source_device_id UUID;

-- Enable RLS on new tables
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_users
CREATE POLICY "Restaurant owners can manage their staff" 
ON public.staff_users 
FOR ALL 
USING (tenant_id = get_user_tenant());

CREATE POLICY "Super admins can view all staff" 
ON public.staff_users 
FOR SELECT 
USING (is_super_admin());

-- RLS Policies for payments
CREATE POLICY "Restaurant owners can manage their payments" 
ON public.payments 
FOR ALL 
USING (tenant_id = get_user_tenant());

CREATE POLICY "Super admins can view all payments" 
ON public.payments 
FOR SELECT 
USING (is_super_admin());

-- RLS Policies for shifts
CREATE POLICY "Restaurant owners can manage their shifts" 
ON public.shifts 
FOR ALL 
USING (tenant_id = get_user_tenant());

CREATE POLICY "Super admins can view all shifts" 
ON public.shifts 
FOR SELECT 
USING (is_super_admin());

-- RLS Policies for pos_devices
CREATE POLICY "Restaurant owners can manage their devices" 
ON public.pos_devices 
FOR ALL 
USING (tenant_id = get_user_tenant());

CREATE POLICY "Super admins can view all devices" 
ON public.pos_devices 
FOR SELECT 
USING (is_super_admin());

-- Create indexes for performance
CREATE INDEX idx_staff_users_tenant_id ON public.staff_users(tenant_id);
CREATE INDEX idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_shifts_tenant_id ON public.shifts(tenant_id);
CREATE INDEX idx_shifts_staff_user_id ON public.shifts(staff_user_id);
CREATE INDEX idx_pos_devices_tenant_id ON public.pos_devices(tenant_id);

-- Update triggers for timestamps
CREATE TRIGGER update_staff_users_updated_at
  BEFORE UPDATE ON public.staff_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pos_devices_updated_at
  BEFORE UPDATE ON public.pos_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();