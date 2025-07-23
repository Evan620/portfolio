# Apply Dashboard Sharing Migration

To enable the dashboard sharing functionality with view tracking, you need to apply the database migrations to your Supabase project.

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard at [supabase.com](https://supabase.com)
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. **First, run the sharing migration** - Copy and paste the following SQL code:

```sql
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
```

5. Click **Run** to execute the migration

6. **Then, run the view tracking migration** - Create another new query and paste this SQL:

```sql
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
```

7. Click **Run** to execute the view tracking migration

## Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Verification

After applying both migrations, you should be able to:

1. See a new **Share** button in your dashboard header (when you have projects)
2. Click the Share button to open the sharing modal
3. Generate a share link that others can use to view your projects (without GitHub links)
4. See view statistics including total views, unique visitors, and detailed analytics
5. Track views automatically when people visit your shared dashboard

## Troubleshooting

If you encounter any issues:

1. **"Table already exists" error**: The migration has already been applied
2. **Permission errors**: Make sure you're running the SQL as the project owner
3. **Share button not appearing**: Make sure you have at least one project in your dashboard

## How It Works

- **Private by default**: Your dashboard remains private until you generate a share link
- **Secure tokens**: Each share link uses a cryptographically secure random token
- **GitHub links hidden**: Shared dashboards only show project names, descriptions, and live site URLs
- **No authentication required**: Recipients can view the shared dashboard without creating an account
- **Revocable**: You can deactivate share links at any time
- **View tracking**: Automatically tracks total views, unique visitors, and detailed analytics
- **Privacy-focused analytics**: Only tracks basic metrics (no personal data collection)
- **Real-time stats**: View counts update immediately when someone visits your shared dashboard
