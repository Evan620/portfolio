-- Add sharing functionality to the database

-- Create shared_dashboards table for managing shareable dashboard links
CREATE TABLE public.shared_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE -- NULL means never expires
);

-- Enable Row Level Security
ALTER TABLE public.shared_dashboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shared_dashboards
CREATE POLICY "Users can view their own shared dashboards" 
ON public.shared_dashboards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shared dashboards" 
ON public.shared_dashboards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared dashboards" 
ON public.shared_dashboards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared dashboards" 
ON public.shared_dashboards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policy to allow public access to active shared dashboards for validation
CREATE POLICY "Public can view active shared dashboards for validation" 
ON public.shared_dashboards 
FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create policy to allow public access to projects via shared dashboard tokens
CREATE POLICY "Public can view projects via shared dashboard" 
ON public.projects 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shared_dashboards sd 
    WHERE sd.user_id = projects.user_id 
    AND sd.is_active = true 
    AND (sd.expires_at IS NULL OR sd.expires_at > now())
  )
);

-- Create policy to allow public access to profiles via shared dashboard tokens
CREATE POLICY "Public can view profiles via shared dashboard" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shared_dashboards sd 
    WHERE sd.user_id = profiles.user_id 
    AND sd.is_active = true 
    AND (sd.expires_at IS NULL OR sd.expires_at > now())
  )
);

-- Create trigger for automatic timestamp updates on shared_dashboards
CREATE TRIGGER update_shared_dashboards_updated_at
  BEFORE UPDATE ON public.shared_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_shared_dashboards_token ON public.shared_dashboards(share_token);
CREATE INDEX idx_shared_dashboards_user_active ON public.shared_dashboards(user_id, is_active);
