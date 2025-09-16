-- Add currency column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN currency TEXT DEFAULT 'SYP' NOT NULL;

-- Add constraint to ensure valid currency codes
ALTER TABLE public.tenants 
ADD CONSTRAINT valid_currency 
CHECK (currency IN ('SYP', 'USD', 'EUR', 'SAR', 'AED', 'JOD', 'LBP'));

-- Add comment to document the currency column
COMMENT ON COLUMN public.tenants.currency IS 'Currency code for the tenant (SYP=Syrian Pound, USD=US Dollar, EUR=Euro, SAR=Saudi Riyal, AED=UAE Dirham, JOD=Jordanian Dinar, LBP=Lebanese Pound)';