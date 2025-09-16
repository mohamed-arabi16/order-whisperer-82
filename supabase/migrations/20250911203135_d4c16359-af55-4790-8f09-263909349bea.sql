-- Create feedback table to store customer feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  customer_name VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback access
CREATE POLICY "Tenant owners can view their feedback" 
ON public.feedback 
FOR SELECT 
USING (
  tenant_id IN (
    SELECT id FROM public.tenants 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Anyone can create feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_feedback_tenant_id ON public.feedback(tenant_id);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);