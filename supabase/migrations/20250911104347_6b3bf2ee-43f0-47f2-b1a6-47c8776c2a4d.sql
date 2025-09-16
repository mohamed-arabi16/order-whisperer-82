-- Add missing color columns to tenants table for theme customization
ALTER TABLE public.tenants 
ADD COLUMN secondary_color TEXT DEFAULT '#f1f5f9',
ADD COLUMN accent_color TEXT DEFAULT '#0ea5e9';