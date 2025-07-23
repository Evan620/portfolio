-- Add view tracking functionality to shared dashboards

-- Add view_count column to shared_dashboards table
ALTER TABLE public.shared_dashboards 
ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

-- Create dashboard_views table for detailed view tracking
CREATE TABLE public.dashboard_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_dashboard_id UUID NOT NULL REFERENCES public.shared_dashboards(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  viewer_user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  referrer TEXT,
  country TEXT,
  city TEXT
);

-- Enable Row Level Security for dashboard_views
ALTER TABLE public.dashboard_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dashboard_views
-- Users can view analytics for their own shared dashboards
CREATE POLICY "Users can view their own dashboard analytics" 
ON public.dashboard_views 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shared_dashboards sd 
    WHERE sd.id = dashboard_views.shared_dashboard_id 
    AND sd.user_id = auth.uid()
  )
);

-- Allow public insertion of view records (for tracking)
CREATE POLICY "Public can insert view records" 
ON public.dashboard_views 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_dashboard_views_shared_dashboard_id ON public.dashboard_views(shared_dashboard_id);
CREATE INDEX idx_dashboard_views_viewed_at ON public.dashboard_views(viewed_at);
CREATE INDEX idx_dashboard_views_viewer_ip ON public.dashboard_views(viewer_ip);

-- Function to increment view count and log view
CREATE OR REPLACE FUNCTION public.track_dashboard_view(
  p_share_token TEXT,
  p_viewer_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  dashboard_id UUID;
BEGIN
  -- Get the shared dashboard ID
  SELECT id INTO dashboard_id
  FROM public.shared_dashboards
  WHERE share_token = p_share_token
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
  
  -- If dashboard not found or inactive, return false
  IF dashboard_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Increment view count
  UPDATE public.shared_dashboards
  SET view_count = view_count + 1
  WHERE id = dashboard_id;
  
  -- Log the view
  INSERT INTO public.dashboard_views (
    shared_dashboard_id,
    viewer_ip,
    viewer_user_agent,
    referrer
  ) VALUES (
    dashboard_id,
    p_viewer_ip,
    p_user_agent,
    p_referrer
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get view statistics for a shared dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_view_stats(p_share_token TEXT)
RETURNS TABLE (
  total_views INTEGER,
  unique_ips INTEGER,
  views_today INTEGER,
  views_this_week INTEGER,
  views_this_month INTEGER,
  recent_views TIMESTAMP WITH TIME ZONE[]
) AS $$
DECLARE
  dashboard_id UUID;
BEGIN
  -- Get the shared dashboard ID
  SELECT sd.id INTO dashboard_id
  FROM public.shared_dashboards sd
  WHERE sd.share_token = p_share_token
    AND sd.user_id = auth.uid()
    AND sd.is_active = true;
  
  -- If dashboard not found, return empty result
  IF dashboard_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get statistics
  SELECT 
    COALESCE(COUNT(*), 0)::INTEGER,
    COALESCE(COUNT(DISTINCT viewer_ip), 0)::INTEGER,
    COALESCE(COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE), 0)::INTEGER,
    COALESCE(COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - INTERVAL '7 days'), 0)::INTEGER,
    COALESCE(COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - INTERVAL '30 days'), 0)::INTEGER,
    ARRAY(
      SELECT viewed_at 
      FROM public.dashboard_views 
      WHERE shared_dashboard_id = dashboard_id 
      ORDER BY viewed_at DESC 
      LIMIT 10
    )
  INTO total_views, unique_ips, views_today, views_this_week, views_this_month, recent_views
  FROM public.dashboard_views
  WHERE shared_dashboard_id = dashboard_id;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
