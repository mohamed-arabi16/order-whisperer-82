-- Fix function search path security issue
-- Update existing functions to set proper search_path

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
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

-- Fix get_user_tenant function  
CREATE OR REPLACE FUNCTION public.get_user_tenant()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id FROM public.tenants t
  JOIN public.profiles p ON t.owner_id = p.id
  WHERE p.user_id = auth.uid();
$$;

-- Fix is_super_admin function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Fix get_current_user_profile function
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS profiles
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE user_id = auth.uid();
$$;