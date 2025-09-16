-- Add Turkish currency support to tenants table
ALTER TYPE currency_type ADD VALUE IF NOT EXISTS 'TRY';
ALTER TYPE currency_type ADD VALUE IF NOT EXISTS 'TL';