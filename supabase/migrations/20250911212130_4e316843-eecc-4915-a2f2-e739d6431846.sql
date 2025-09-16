-- Update currency constraint to include Turkish currency options
ALTER TABLE public.tenants DROP CONSTRAINT IF EXISTS valid_currency;
ALTER TABLE public.tenants ADD CONSTRAINT valid_currency 
  CHECK (currency IN ('SYP', 'USD', 'EUR', 'SAR', 'AED', 'JOD', 'LBP', 'TRY', 'TL'));